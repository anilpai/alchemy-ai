import dayjs from "dayjs";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useConversationStore, useConnectionStore, useMessageStore, useUserStore, useSettingStore } from "@/store";
import { Message } from "@/types";
import Dropdown, { DropdownItem } from "../ui/Dropdown";
import Icon from "../Icon";
import { CodeBlock } from "../CodeBlock";
import EngineIcon from "../EngineIcon";
import ThreeDotsLoader from "./ThreeDotsLoader";

interface Props {
  message: Message;
}

const MessageView = (props: Props) => {
  const message = props.message;
  const { t } = useTranslation();
  const settingStore = useSettingStore();
  const userStore = useUserStore();
  const conversationStore = useConversationStore();
  const connectionStore = useConnectionStore();
  const messageStore = useMessageStore();
  const isCurrentUser = message.creatorId === userStore.currentUser.id;
  const connection = connectionStore.getConnectionById(conversationStore.getConversationById(message.conversationId)?.connectionId || "");

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  const deleteMessage = (message: Message) => {
    messageStore.clearMessage((item) => item.id !== message.id);
  };

  return (
    <div
      className={`w-full max-w-full flex flex-row justify-start items-start my-4 group ${
        isCurrentUser ? "justify-end sm:pl-24" : "sm:pr-24"
      }`}
    >
      {isCurrentUser ? (
        <>
          <div className="invisible group-hover:visible">
            <Dropdown
              tigger={
                <button
                  className="flex items-center justify-center w-6 h-6 mt-2 mr-1 text-gray-400 shrink-0 hover:text-gray-500"
                  title="More options"
                >
                  <Icon.IoMdMore className="w-5 h-auto" />
                </button>
              }
            >
              <div className="flex flex-col items-start justify-start p-1 bg-white rounded-lg dark:bg-zinc-900">
                <DropdownItem
                  className="flex flex-row items-center justify-start w-full p-1 px-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
                  onClick={copyMessage}
                >
                  <Icon.BiClipboard className="w-4 h-auto mr-2 opacity-70" />
                  {t("common.copy")}
                </DropdownItem>
                <DropdownItem
                  className="flex flex-row items-center justify-start w-full p-1 px-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
                  onClick={() => deleteMessage(message)}
                >
                  <Icon.BiTrash className="w-4 h-auto mr-2 opacity-70" />
                  {t("common.delete")}
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
          <div className="w-auto max-w-[calc(100%-2rem)] flex flex-col justify-start items-start">
            <div className="w-full px-4 py-2 text-white break-all whitespace-pre-wrap bg-indigo-600 rounded-lg dark:text-gray-200">
              {message.content}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center mr-2 shrink-0">
            {connection ? (
              <EngineIcon className="w-10 h-auto p-1 dark:border-zinc-700" engine={connection.engineType} />
            ) : (
              <img className="w-10 h-auto p-1" src="/banner.png" alt="" />
            )}
          </div>
          {message.status === "LOADING" && message.content === "" ? (
            <div className="mt-0.5 w-12 bg-gray-100 dark:bg-zinc-700 px-4 py-2 rounded-lg">
              <ThreeDotsLoader />
            </div>
          ) : (
            <>
              <div className="w-auto max-w-[calc(100%-2rem)] flex flex-col justify-start items-start">
                <ReactMarkdown
                  className={`w-auto max-w-full bg-gray-100 dark:bg-zinc-700 px-4 py-2 rounded-lg prose prose-neutral dark:prose-invert ${
                    message.status === "FAILED" && "border border-red-400 bg-red-100 text-red-500"
                  }`}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre({ node, className, children, ...props }) {
                      const child = children[0] as ReactElement;
                      const match = /language-(\w+)/.exec(child.props.className || "");
                      const language = match ? match[1] : "SQL";
                      return (
                        <pre className={`${className || ""} w-full p-0 my-1`} {...props}>
                          <CodeBlock
                            key={Math.random()}
                            messageId={message.id}
                            language={language || "SQL"}
                            value={String(child.props.children).replace(/\n$/, "")}
                            {...props}
                          />
                        </pre>
                      );
                    },
                    code({ children }) {
                      return <code className="px-0">{children}</code>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                <span className="self-start pt-1 pl-1 text-sm text-gray-400">
                  {dayjs(message.createdAt).locale(settingStore.setting.locale).format("lll")}
                </span>
              </div>
              <div className="invisible group-hover:visible">
                <Dropdown
                  tigger={
                    <button className="flex items-center justify-center w-6 h-6 mt-2 ml-1 text-gray-400 shrink-0 hover:text-gray-500">
                      <Icon.IoMdMore className="w-5 h-auto" />
                    </button>
                  }
                >
                  <div className="flex flex-col items-start justify-start p-1 bg-white rounded-lg dark:bg-zinc-900">
                    <DropdownItem
                      className="flex flex-row items-center justify-start w-full p-1 px-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
                      onClick={copyMessage}
                    >
                      <Icon.BiClipboard className="w-4 h-auto mr-2 opacity-70" />
                      {t("common.copy")}
                    </DropdownItem>
                    <DropdownItem
                      className="flex flex-row items-center justify-start w-full p-1 px-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
                      onClick={() => deleteMessage(message)}
                    >
                      <Icon.BiTrash className="w-4 h-auto mr-2 opacity-70" />
                      {t("common.delete")}
                    </DropdownItem>
                  </div>
                </Dropdown>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MessageView;
