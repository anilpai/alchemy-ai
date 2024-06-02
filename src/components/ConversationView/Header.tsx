import { useEffect } from "react";
import { useConversationStore, useLayoutStore } from "@/store";
import Icon from "../Icon";
import ConversationTabsView from "../ConversationTabsView";

interface Props {
  className?: string;
}

const Header = (props: Props) => {
  const { className } = props;
  const layoutStore = useLayoutStore();
  const conversationStore = useConversationStore();
  const currentConversationId = conversationStore.currentConversationId;
  const title = conversationStore.getConversationById(currentConversationId)?.title || "SQL Chat";

  useEffect(() => {
    document.title = `${title}`;
  }, [title]);

  return (
    <>
      <div className={`${className || ""} w-full border-b dark:border-zinc-700 z-1`}>
        <div className="flex flex-row items-center justify-between w-full my-2 lg:grid lg:grid-cols-3">
          <div className="flex items-center justify-start ml-2">
            <button
              className="block w-8 h-8 p-1 mr-1 rounded-md cursor-pointer lg:hidden hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={() => layoutStore.toggleSidebar()}
              title="Toggle Sidebar"
            >
              <Icon.IoIosMenu className="w-full h-auto text-gray-600" />
            </button>
            <span className="block w-auto text-left lg:hidden">{title}</span>
          </div>
        </div>
        <ConversationTabsView />
      </div>
    </>
  );
};

export default Header;
