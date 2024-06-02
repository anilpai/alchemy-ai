import { head } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useConnectionStore } from "@/store";
import { Connection } from "@/types";
import Tooltip from "../ui/Tooltip";
import Icon from "../Icon";
import EngineIcon from "../EngineIcon";
import EditConnectionModal from "../EditConnectionModal";

interface State {
  showEditConnectionModal: boolean;
  showUpdateConversationModal: boolean;
}

const ConnectionList = () => {
  const { t } = useTranslation();
  const connectionStore = useConnectionStore();
  const [state, setState] = useState<State>({
    showEditConnectionModal: false,
    showUpdateConversationModal: false,
  });
  const [editConnectionModalContext, setEditConnectionModalContext] = useState<Connection>();
  const connectionList = connectionStore.connectionList;
  const currentConnectionCtx = connectionStore.currentConnectionCtx;

  const toggleEditConnectionModal = (show = true) => {
    setState({
      ...state,
      showEditConnectionModal: show,
    });
    setEditConnectionModalContext(undefined);
  };

  const handleConnectionSelect = async (connection: Connection) => {
    const databaseList = await connectionStore.getOrFetchDatabaseList(connection);
    connectionStore.setCurrentConnectionCtx({
      connection,
      database: head(databaseList),
    });
  };

  const handleEditConnection = (connection: Connection) => {
    setState({
      ...state,
      showEditConnectionModal: true,
    });
    setEditConnectionModalContext(connection);
  };

  return (
    <>
      {connectionList.map((connection) => (
        <Tooltip key={connection.id} title={connection.title} side="right">
          <button
            className={`relative w-full h-12 rounded-l-lg p-2 mt-2 group ${
              currentConnectionCtx?.connection.id === connection.id && "bg-gray-100 dark:bg-zinc-700 shadow"
            }`}
            onClick={() => handleConnectionSelect(connection)}
            title="Select Connection"
          >
            <span
              className="absolute right-0.5 -mt-1.5 opacity-60 hidden group-hover:block hover:opacity-80"
              onClick={(e) => {
                e.stopPropagation();
                handleEditConnection(connection);
              }}
            >
              <Icon.FiEdit3 className="w-3.5 h-auto dark:text-gray-300" />
            </span>
            <EngineIcon engine={connection.engineType} className="w-auto h-full mx-auto dark:text-gray-300" />
          </button>
        </Tooltip>
      ))}
      {state.showEditConnectionModal && (
        <EditConnectionModal connection={editConnectionModalContext} close={() => toggleEditConnectionModal(false)} />
      )}
    </>
  );
};

export default ConnectionList;
