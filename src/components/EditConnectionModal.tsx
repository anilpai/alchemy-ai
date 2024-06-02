import { cloneDeep, head } from "lodash-es";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import { useConnectionStore } from "@/store";
import { Connection, Engine, ResponseObject, SSLOptions } from "@/types";
import Radio from "./ui/Radio";
import TextField from "./ui/TextField";
import Modal from "./ui/Modal";
import Icon from "./Icon";
import EngineIcon from "./EngineIcon";
import RequiredStar from "./RequiredStar";

interface Props {
  connection?: Connection;
  close: () => void;
}

type SSLType = "preferred" | "ca-only" | "full";

type SSLFieldType = "ca" | "cert" | "key";

const SSLTypeOptions = [
  {
    label: "Preferred",
    value: "preferred",
  },
  {
    label: "CA Only",
    value: "ca-only",
  },
  {
    label: "Full",
    value: "full",
  },
];

const engines = [
  {
    type: Engine.PostgreSQL,
    name: "PostgreSQL",
    defaultPort: "5432",
  },
];

const defaultConnection: Connection = {
  id: "",
  title: "",
  engineType: Engine.PostgreSQL,
  host: "",
  port: "3306",
  username: "",
  password: "",
};

const EditConnectionModal = (props: Props) => {
  const { connection: editConnection, close } = props;
  const { t } = useTranslation();
  const connectionStore = useConnectionStore();
  const [connection, setConnection] = useState<Connection>(defaultConnection);
  const [sslType, setSSLType] = useState<SSLType>("preferred");
  const [selectedSSLField, setSelectedSSLField] = useState<SSLFieldType>("ca");
  const [isRequesting, setIsRequesting] = useState(false);
  const showDatabaseField = connection.engineType === Engine.PostgreSQL;
  const isEditing = editConnection !== undefined;
  const allowSave = connection.title !== "" && connection.host !== "" && connection.username !== "";

  useEffect(() => {
    const connection = isEditing ? editConnection : defaultConnection;
    setConnection(connection);
    if (connection.ssl) {
      if (connection.ssl.ca && connection.ssl.cert && connection.ssl.key) {
        setSSLType("full");
      } else {
        setSSLType("ca-only");
      }
    }
  }, []);

  useEffect(() => {
    let ssl: SSLOptions | undefined = undefined;
    if (sslType === "ca-only") {
      ssl = {
        ca: "",
      };
    } else if (sslType === "full") {
      ssl = {
        ca: "",
        cert: "",
        key: "",
      };
    }
    setConnection((connection) => ({
      ...connection,
      ssl: ssl,
    }));
    setSelectedSSLField("ca");
  }, [sslType]);

  const setPartialConnection = (state: Partial<Connection>) => {
    setConnection({
      ...connection,
      ...state,
    });
  };

  const handleSSLFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (file.type.startsWith("audio/") || file.type.startsWith("video/") || file.type.startsWith("image/")) {
      toast.error(`Invalid file type:${file.type}`);
      return;
    }

    const fr = new FileReader();
    fr.addEventListener("load", () => {
      setPartialConnection({
        ssl: {
          ...connection.ssl,
          [selectedSSLField]: fr.result as string,
        },
      });
    });
    fr.addEventListener("error", () => {
      toast.error("Failed to read file");
    });
    fr.readAsText(file);
  };

  const handleSSLValueChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPartialConnection({
      ssl: {
        ...connection.ssl,
        [selectedSSLField]: event.target.value,
      },
    });
  };

  const handleUpsertConnection = async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    const tempConnection = cloneDeep(connection);
    if (!showDatabaseField) {
      tempConnection.database = undefined;
    }

    try {
      const response = await fetch("/api/connection/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connection: tempConnection,
        }),
      });
      const result = (await response.json()) as ResponseObject<boolean>;
      if (result.message) {
        toast.error(result.message);
        return;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to test connection");
    } finally {
      setIsRequesting(false);
    }

    try {
      let connection: Connection;
      if (isEditing) {
        connectionStore.updateConnection(tempConnection.id, tempConnection);
        connection = tempConnection;
      } else {
        connection = connectionStore.editConnection(tempConnection);
      }

      // Set the created connection as the current connection.
      const databaseList = await connectionStore.getOrFetchDatabaseList(connection, true);
      connectionStore.setCurrentConnectionCtx({
        connection: connection,
        database: head(databaseList),
      });
    } catch (error) {
      console.error(error);
      setIsRequesting(false);
      toast.error("Failed to create connection");
      return;
    }

    setIsRequesting(false);
    close();
  };

  return (
    <>
      <Modal title={isEditing ? t("connection.edit") : t("connection.new")} onClose={close}>
        <div className="flex flex-col items-start justify-start w-full mt-2 space-y-3">
          <div className="flex flex-col w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {t("connection.database-type")}
              <RequiredStar />
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {engines.map((engine) => (
                <div
                  key={engine.type}
                  className="relative flex items-center px-4 py-2 space-x-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
                  onClick={() => setPartialConnection({ engineType: engine.type, port: engine.defaultPort })}
                >
                  <Radio value={engine.type} checked={connection.engineType === engine.type} />
                  <EngineIcon className="w-6 h-6" engine={engine.type} />
                  <label htmlFor={engine.type} className="block ml-3 text-sm font-medium leading-6 text-gray-900 cursor-pointer">
                    {engine.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {t("connection.title")}
              <RequiredStar />
            </label>
            <TextField placeholder="Title" value={connection.title} onChange={(value) => setPartialConnection({ title: value })} />
          </div>
          <div className="flex flex-col w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {t("connection.host")}
              <RequiredStar />
            </label>
            <TextField placeholder="Connection host" value={connection.host} onChange={(value) => setPartialConnection({ host: value })} />
          </div>
          <div className="flex flex-col w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">{t("connection.port")}</label>
            <TextField placeholder="Connection port" value={connection.port} onChange={(value) => setPartialConnection({ port: value })} />
          </div>
          {showDatabaseField && (
            <div className="flex flex-col w-full">
              <label className="block mb-1 text-sm font-medium text-gray-700">{t("connection.database-name")}</label>
              <TextField
                placeholder="Connection database"
                value={connection.database || ""}
                onChange={(value) => setPartialConnection({ database: value })}
              />
            </div>
          )}
          <div className="flex flex-col w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {t("connection.username")}
              <RequiredStar />
            </label>
            <TextField
              placeholder="Connection username"
              value={connection.username || ""}
              onChange={(value) => setPartialConnection({ username: value })}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">{t("connection.password")}</label>
            <TextField
              placeholder="Connection password"
              type="password"
              value={connection.password || ""}
              onChange={(value) => setPartialConnection({ password: value })}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block mb-1 text-sm font-medium text-gray-700">SSL</label>
            <div className="flex flex-row flex-wrap items-start justify-start w-full">
              {SSLTypeOptions.map((option) => (
                <label key={option.value} className="flex flex-row items-center justify-start w-auto mb-3 mr-3 cursor-pointer">
                  <Radio
                    className="w-4 h-4 mr-1 radio"
                    value={option.value}
                    checked={sslType === option.value}
                    onChange={(value) => setSSLType(value as SSLType)}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {sslType !== "preferred" && (
              <>
                <div className="mb-2 space-x-3 text-sm">
                  <span
                    className={`leading-6 pb-1 border-b-2 border-transparent cursor-pointer opacity-60 hover:opacity-80 ${
                      selectedSSLField === "ca" && "!border-indigo-600 !opacity-100"
                    } `}
                    onClick={() => setSelectedSSLField("ca")}
                  >
                    CA Certificate
                  </span>
                  {sslType === "full" && (
                    <>
                      <span
                        className={`leading-6 pb-1 border-b-2 border-transparent cursor-pointer opacity-60 hover:opacity-80 ${
                          selectedSSLField === "key" && "!border-indigo-600 !opacity-100"
                        }`}
                        onClick={() => setSelectedSSLField("key")}
                      >
                        Client Key
                      </span>
                      <span
                        className={`leading-6 pb-1 border-b-2 border-transparent cursor-pointer opacity-60 hover:opacity-80 ${
                          selectedSSLField === "cert" && "!border-indigo-600 !opacity-100"
                        }`}
                        onClick={() => setSelectedSSLField("cert")}
                      >
                        Client Certificate
                      </span>
                    </>
                  )}
                </div>
                <div className="relative w-full h-auto">
                  <TextareaAutosize
                    className="w-full p-3 text-sm border rounded-lg resize-none"
                    minRows={3}
                    maxRows={3}
                    value={(connection.ssl && connection.ssl[selectedSSLField]) ?? ""}
                    onChange={handleSSLValueChange}
                  />
                  <div
                    className={`${
                      connection.ssl && connection.ssl[selectedSSLField] && "hidden"
                    } absolute top-3 left-4 text-gray-400 text-sm leading-6 pointer-events-none`}
                  >
                    <span className="">Input or </span>
                    <label className="px-2 py-1 border border-dashed rounded-lg cursor-pointer pointer-events-auto hover:border-gray-600 hover:text-gray-600">
                      upload file
                      <input className="hidden" type="file" onChange={handleSSLFileInputChange} />
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-between w-full space-x-2 modal-action">
          <div>
            {isEditing && (
              <button className="btn btn-outline" onClick={close}>
                {t("common.close")}
              </button>
            )}
          </div>
          <div className="flex flex-row justify-center space-x-2">
            <button className="btn" disabled={isRequesting || !allowSave} onClick={handleUpsertConnection}>
              {isRequesting && <Icon.BiLoaderAlt className="w-4 h-auto mr-1 animate-spin" />}
              {t("common.save")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditConnectionModal;
