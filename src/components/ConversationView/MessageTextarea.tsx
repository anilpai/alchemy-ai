import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import { useConversationStore, useConnectionStore } from "@/store";
import Icon from "../Icon";

interface Props {
  disabled?: boolean;
  sendMessage: (content: string) => Promise<void>;
}

const MessageTextarea = (props: Props) => {
  const { disabled, sendMessage } = props;
  const { t } = useTranslation();
  const connectionStore = useConnectionStore();
  const conversationStore = useConversationStore();
  const [value, setValue] = useState<string>("");
  const [isInIME, setIsInIME] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleSend = async () => {
    let conversation = conversationStore.getConversationById(conversationStore.currentConversationId);
    if (!conversation) {
      const currentConnectionCtx = connectionStore.currentConnectionCtx;
      if (!currentConnectionCtx) {
        conversation = conversationStore.createConversation();
      } else {
        conversation = conversationStore.createConversation(currentConnectionCtx.connection.id, currentConnectionCtx.database?.name);
      }
    }
    if (!value) {
      toast.error("Please enter a message.");
      return;
    }
    if (disabled) {
      return;
    }

    setValue("");
    textareaRef.current!.value = "";
    await sendMessage(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey && !isInIME) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex flex-row items-end justify-between w-full h-auto px-2 py-1 bg-white border rounded-lg shadow dark:border-zinc-700 dark:bg-zinc-800">
      <TextareaAutosize
        ref={textareaRef}
        className="w-full h-full px-2 py-2 leading-6 bg-transparent border-none outline-none resize-none hide-scrollbar"
        placeholder={t("editor.placeholder") || ""}
        rows={1}
        minRows={1}
        maxRows={5}
        onCompositionStart={() => setIsInIME(true)}
        onCompositionEnd={() => setIsInIME(false)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button
        className="w-8 p-1 -translate-y-1 rounded-md cursor-pointer hover:shadow hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={handleSend}
        title="Send Message"
      >
        <Icon.IoMdSend className="w-full h-auto text-indigo-600" />
      </button>
    </div>
  );
};

export default MessageTextarea;
