import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import { useQueryStore, useConnectionStore, useLayoutStore } from "@/store";
import { ExecutionResult, ResponseObject } from "@/types";
import { checkStatementIsSelect, getMessageFromExecutionResult } from "@/utils";
import Icon from "./Icon";
import EngineIcon from "./EngineIcon";
import DataTableView from "./ExecutionView/DataTableView";
import NotificationView from "./ExecutionView/NotificationView";
import ExecutionWarningBanner from "./ExecutionView/ExecutionWarningBanner";
import Select from "./ui/Select";

const QueryEditor = () => {
  const { t } = useTranslation();
  const queryStore = useQueryStore();
  const connectionStore = useConnectionStore();
  const layoutStore = useLayoutStore();
  const currentConnectionCtx = connectionStore.currentConnectionCtx;
  const databaseList = connectionStore.databaseList.filter((database) => database.connectionId === currentConnectionCtx?.connection.id);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | undefined>(undefined);
  const [originalStatement, setOriginalStatement] = useState<string>("");
  const [statement, setStatement] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const context = queryStore.context;
  const executionMessage = executionResult ? getMessageFromExecutionResult(executionResult) : "";
  const showExecutionWarningBanner = statement.trim() && !checkStatementIsSelect(statement);

  useEffect(() => {
    const statement = context?.statement || "";
    setStatement(statement);
    // Save original statement when open QueryEditor.
    if (!originalStatement) {
      setOriginalStatement(statement);
    }

    if (statement !== "" && checkStatementIsSelect(statement)) {
      executeStatement(statement);
    }
    setExecutionResult(undefined);
  }, [context]);

  useEffect(() => {
    if (!currentConnectionCtx) {
      toast.error("Please select a connection first");
      return;
    }

    queryStore.setContext({
      connection: currentConnectionCtx.connection,
      database: currentConnectionCtx.database,
      messageId: "",
      statement: "",
    });
  }, [currentConnectionCtx]);

  const executeStatement = async (statement: string) => {
    if (!statement) {
      toast.error("Please enter a statement.");
      return;
    }

    if (!context) {
      toast.error("No execution context found.");
      setIsLoading(false);
      setExecutionResult(undefined);
      return;
    }

    setIsLoading(true);
    setExecutionResult(undefined);
    const { connection, database } = context;
    try {
      const response = await fetch("/api/connection/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connection,
          db: database?.name,
          statement,
        }),
      });
      const result = (await response.json()) as ResponseObject<ExecutionResult>;
      if (result.message) {
        setExecutionResult({
          rawResult: [],
          error: result.message,
        });
      } else {
        setExecutionResult(result.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to execute statement");
    } finally {
      setIsLoading(false);
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
  };

  return (
    <div
      className={`${
        layoutStore.showSidebar && "sm:pl-80"
      } relative w-full h-full max-h-full flex flex-col justify-start items-start overflow-y-auto bg-white dark:bg-zinc-800`}
    >
      <div className="w-full h-auto max-w-4xl p-2 px-4 py-1 mx-auto grow sm:px-8">
        <h3 className="mt-4 text-2xl font-bold">{t("execution.title")}</h3>
        {!context ? (
          <div className="flex flex-col items-center justify-center w-full py-6 pt-10">
            <Icon.BiSad className="h-auto w-7 opacity-70" />
            <span className="mt-2 font-mono text-sm text-gray-500">{t("execution.message.no-connection")}</span>
          </div>
        ) : (
          <>
            <div className="flex flex-row items-center justify-start w-full mt-4 space-x-4">
              <span className="opacity-70">{t("connection.self")}: </span>
              <EngineIcon className="w-6 h-auto" engine={context.connection.engineType} />
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
            </div>
            {showExecutionWarningBanner && <ExecutionWarningBanner className="mt-4 rounded-lg" />}
            <div className="flex flex-row items-end justify-between w-full h-auto px-2 mt-4 border rounded-lg dark:border-zinc-700">
              <TextareaAutosize
                className="w-full h-full py-2 pl-2 font-mono text-sm leading-6 break-all whitespace-pre-wrap bg-transparent border-none outline-none resize-none hide-scrollbar"
                value={statement}
                rows={5}
                minRows={3}
                maxRows={20}
                placeholder="Enter your SQL statement here..."
                onChange={(e) => setStatement(e.target.value)}
              />
              <button
                className="flex flex-row items-center h-8 px-4 py-1 -translate-y-2 bg-indigo-600 rounded-md cursor-pointer whitespace-nowrap hover:shadow opacity-90 hover:opacity-100 text-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => executeStatement(statement)}
              >
                <Icon.FiPlay className="mr-1" />
                {t("common.run-sql")}
              </button>
            </div>
            <div className="flex flex-col items-start justify-start w-full mt-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full py-6 pt-10">
                  <Icon.BiLoaderAlt className="h-auto w-7 opacity-70 animate-spin" />
                  <span className="mt-2 font-mono text-sm text-gray-500">{t("execution.message.executing")}</span>
                </div>
              ) : (
                <>
                  {executionResult ? (
                    executionMessage ? (
                      <NotificationView message={executionMessage} style={executionResult?.error ? "error" : "info"} />
                    ) : (
                      <DataTableView rawResults={executionResult?.rawResult || []} />
                    )
                  ) : (
                    <></>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QueryEditor;
