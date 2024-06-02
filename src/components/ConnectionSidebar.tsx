import { Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConnectionStore, useConversationStore, useLayoutStore, ResponsiveWidth, useSettingStore } from "@/store";
import { Engine, Table, Schema } from "@/types";
import useLoading from "@/hooks/useLoading";
import Select from "./ui/Select";
import Icon from "./Icon";
import DarkModeSwitch from "./DarkModeSwitch";
import ConnectionList from "./Sidebar/ConnectionList";
import { countTextTokens, getModel } from "../utils";
import SettingAvatarIcon from "./SettingAvatarIcon";
import Checkbox from "./ui/Checkbox";
import { head } from "lodash-es";

const ConnectionSidebar = () => {
  const { t } = useTranslation();
  const settingStore = useSettingStore();
  const layoutStore = useLayoutStore();
  const connectionStore = useConnectionStore();
  const conversationStore = useConversationStore();
  const [isRequestingDatabase, setIsRequestingDatabase] = useState<boolean>(false);
  const currentConnectionCtx = connectionStore.currentConnectionCtx;
  const databaseList = connectionStore.databaseList.filter((database) => database.connectionId === currentConnectionCtx?.connection.id);
  const [tableList, updateTableList] = useState<Table[]>([]);
  const [schemaList, updateSchemaList] = useState<Schema[]>([]);
  const selectedTableNameList: string[] =
    conversationStore.getConversationById(conversationStore.currentConversationId)?.selectedTableNameList || [];
  const selectedSchemaName: string =
    conversationStore.getConversationById(conversationStore.currentConversationId)?.selectedSchemaName || "";
  const tableSchemaLoadingState = useLoading();
  const currentConversation = conversationStore.getConversationById(conversationStore.currentConversationId);
  const maxToken = getModel(settingStore.setting.openAIApiConfig?.model || "").max_token;
  const [totalToken, setTotalToken] = useState<number>(0);
  const hasSchemaProperty: boolean = currentConnectionCtx?.connection.engineType === Engine.PostgreSQL;

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < ResponsiveWidth.sm) {
        layoutStore.toggleSidebar(false);
      } else {
        layoutStore.toggleSidebar(true);
      }
    };

    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    // Update the total number of tokens
    const totalToken = selectedTableNameList.reduce((totalToken, tableName) => {
      const table = tableList.find((table) => table.name === tableName);
      // The old cache might not have a token, so the value could be undefined.
      return totalToken + (table?.token || countTextTokens(table?.structure || ""));
    }, 0);
    setTotalToken(totalToken);
  }, [selectedTableNameList, tableList]);

  useEffect(() => {
    if (currentConnectionCtx?.connection) {
      setIsRequestingDatabase(true);
      connectionStore.getOrFetchDatabaseList(currentConnectionCtx.connection).finally(() => {
        setIsRequestingDatabase(false);
        const database = databaseList.find(
          (database) => database.name === useConnectionStore.getState().currentConnectionCtx?.database?.name
        );
        if (database) {
          tableSchemaLoadingState.setLoading();
          connectionStore.getOrFetchDatabaseSchema(database).then(() => {
            tableSchemaLoadingState.setFinish();
          });
        }
      });
    } else {
      setIsRequestingDatabase(false);
    }
  }, [currentConnectionCtx?.connection]);

  useEffect(() => {
    const schemaList =
      connectionStore.databaseList.find(
        (database) =>
          database.connectionId === currentConnectionCtx?.connection.id && database.name === currentConnectionCtx?.database?.name
      )?.schemaList || [];

    updateSchemaList(schemaList);
    // A conversation must be created first. Otherwise, the updateSelectedSchemaName function will fail.
    createConversation();
  }, [connectionStore, hasSchemaProperty, currentConnectionCtx]);

  useEffect(() => {
    const tableList = schemaList.find((schema) => schema.name === selectedSchemaName)?.tables || [];
    updateTableList(tableList);

    // Initially, select tables until the token limit is reached.
    const defaultCheckedTableList = [];
    if (selectedTableNameList.length === 0) {
      let tokenCount = 0;
      for (const table of tableList) {
        tokenCount += countTextTokens(table?.structure || "");
        if (tokenCount > maxToken) {
          break;
        }
        defaultCheckedTableList.push(table.name);
      }
      conversationStore.updateSelectedTablesNameList(defaultCheckedTableList);
    }
  }, [selectedSchemaName, schemaList]);

  useEffect(() => {
    if (hasSchemaProperty && selectedSchemaName === "" && schemaList.length > 0) {
      conversationStore.updateSelectedSchemaName(head(schemaList)?.name || "");
    }
  }, [schemaList, currentConversation]);

  const syncDatabaseList = async () => {
    if (!currentConnectionCtx?.connection) {
      return;
    }

    const prevDatabase = currentConnectionCtx.database;
    const databaseList = await connectionStore.getOrFetchDatabaseList(currentConnectionCtx.connection, true);

    // If the current database is present in the updated list of databases, maintain its selection.
    const database = databaseList.find((database) => database.name === prevDatabase?.name);
    connectionStore.setCurrentConnectionCtx({
      connection: currentConnectionCtx.connection,
      database: database ? database : head(databaseList),
    });
    if (database) {
      tableSchemaLoadingState.setLoading();
      connectionStore.getOrFetchDatabaseSchema(database).then(() => {
        tableSchemaLoadingState.setFinish();
      });
    }
  };

  const handleDatabaseNameSelect = async (databaseName: string) => {
    if (!currentConnectionCtx?.connection) {
      return;
    }

    const databaseList = await connectionStore.getOrFetchDatabaseList(currentConnectionCtx.connection);
    const database = databaseList.find((database) => database.name === databaseName);
    connectionStore.setCurrentConnectionCtx({
      connection: currentConnectionCtx.connection,
      database: database,
    });
    if (database) {
      tableSchemaLoadingState.setLoading();
      connectionStore.getOrFetchDatabaseSchema(database).then(() => {
        tableSchemaLoadingState.setFinish();
      });
    }
  };

  // Create a new conversation only when there is no current conversation.
  const createConversation = () => {
    if (!currentConversation) {
      if (!currentConnectionCtx) {
        conversationStore.createConversation();
      } else {
        conversationStore.createConversation(currentConnectionCtx.connection.id, currentConnectionCtx.database?.name);
      }
    }
  };

  const handleTableCheckboxChange = async (tableName: string, value: boolean) => {
    if (value) {
      conversationStore.updateSelectedTablesNameList([...selectedTableNameList, tableName]);
    } else {
      conversationStore.updateSelectedTablesNameList(selectedTableNameList.filter((name) => name !== tableName));
    }
  };

  const handleSchemaNameSelect = async (schemaName: string) => {
    // Clear selectedTableNameList when schemaName changes to prevent referencing tables that don't exist in the new schema.
    conversationStore.updateSelectedTablesNameList([]);
    conversationStore.updateSelectedSchemaName(schemaName);
  };

  return (
    <>
      <Drawer
        className="!z-10"
        variant={"persistent"}
        open={layoutStore.showSidebar}
        onClose={() => layoutStore.toggleSidebar(false)}
        ModalProps={{ disablePortal: true }}
      >
        <div className="flex flex-row items-start justify-start h-full overflow-y-hidden w-80">
          <div className="flex flex-col items-center justify-between w-16 h-full py-4 pt-6 pl-2 bg-gray-200 dark:bg-zinc-600">
            <div className="flex flex-col items-start justify-start w-full">
              <ConnectionList />
            </div>
            <div className="flex flex-col items-center justify-end w-full space-y-2">
              <DarkModeSwitch />
              <SettingAvatarIcon />
            </div>
          </div>
          <div className="relative flex flex-col items-start justify-start w-64 h-full p-4 pb-0 overflow-y-auto bg-gray-100 dark:bg-zinc-700">
            <div className="w-full grow">
              {isRequestingDatabase ? (
                <div className="sticky top-0 flex flex-row items-center justify-start w-full h-12 px-4 mt-4 mb-4 text-sm text-gray-600 border rounded-lg z-1 dark:text-gray-400">
                  <Icon.BiLoaderAlt className="w-4 h-auto mr-1 animate-spin" /> {t("common.loading")}
                </div>
              ) : (
                currentConnectionCtx && (
                  <button
                    onClick={() => syncDatabaseList()}
                    className="flex items-center justify-center w-full px-2 py-1 mt-4 mb-4 space-x-1 bg-white border rounded-lg dark:text-gray-300 dark:bg-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    <Icon.BiRefresh className="w-auto h-6" />
                    <span>{t("connection.refresh-schema")}</span>
                  </button>
                )
              )}
              {databaseList.length > 0 && (
                <div className="sticky top-0 w-full z-1">
                  <Select
                    className="w-full px-4 py-3 !text-base"
                    value={currentConnectionCtx?.database?.name}
                    itemList={databaseList.map((database) => {
                      return {
                        label: database.name,
                        value: database.name,
                      };
                    })}
                    onValueChange={(databaseName) => handleDatabaseNameSelect(databaseName)}
                    placeholder={t("connection.select-database") || ""}
                  />
                </div>
              )}
              {hasSchemaProperty && schemaList.length > 0 && (
                <Select
                  className="w-full px-4 py-3 !text-base mt-2"
                  value={selectedSchemaName}
                  itemList={schemaList.map((schema) => {
                    return {
                      label: schema.name,
                      value: schema.name,
                    };
                  })}
                  onValueChange={(schema) => handleSchemaNameSelect(schema)}
                  placeholder={t("connection.select-schema") || ""}
                />
              )}

              {currentConnectionCtx && !tableSchemaLoadingState.isLoading && (
                <div className="flex justify-between px-1 mt-3 mb-2 text-sm text-gray-700 dark:text-gray-300">
                  <div>{t("connection.total-token")}</div>
                  <div>
                    {totalToken}/{maxToken}
                  </div>
                </div>
              )}

              {currentConnectionCtx &&
                (tableSchemaLoadingState.isLoading ? (
                  <div className="sticky top-0 flex flex-row items-center justify-start w-full h-12 px-4 mb-4 text-sm text-gray-600 rounded-lg z-1 dark:text-gray-400">
                    <Icon.BiLoaderAlt className="w-4 h-auto mr-1 animate-spin" /> {t("common.loading")}
                  </div>
                ) : (
                  tableList.length > 0 &&
                  tableList.map((table) => {
                    return (
                      <div key={table.name}>
                        <Checkbox
                          value={selectedTableNameList.includes(table.name)}
                          label={table.name}
                          onValueChange={handleTableCheckboxChange}
                        >
                          <div className="text-sm text-gray-700 dark:text-gray-300">{table.token || countTextTokens(table.structure)}</div>
                        </Checkbox>
                      </div>
                    );
                  })
                ))}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ConnectionSidebar;
