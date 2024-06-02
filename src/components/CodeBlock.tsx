import copy from "copy-to-clipboard";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useConnectionStore, useQueryStore } from "@/store";
import Icon from "./Icon";
import Tooltip from "./ui/Tooltip";
import { Id } from "@/types";

interface Props {
  language: string;
  value: string;
  messageId: Id;
  wrapLongLines?: boolean;
}

export const CodeBlock = (props: Props) => {
  const { language, value, messageId, wrapLongLines } = props;
  const { t } = useTranslation();
  const connectionStore = useConnectionStore();
  const queryStore = useQueryStore();
  const currentConnectionCtx = connectionStore.currentConnectionCtx;
  // Only show execute button in the following situations:
  // * SQL code;
  // * Connection setup;
  const showExecuteButton = currentConnectionCtx?.connection && currentConnectionCtx?.database && language.toUpperCase() === "SQL";

  const copyToClipboard = () => {
    copy(value);
    toast.success("Copied to clipboard");
  };

  const handleExecuteQuery = () => {
    if (!currentConnectionCtx) {
      toast.error("Please select a connection first");
      return;
    }

    queryStore.setContext({
      connection: currentConnectionCtx.connection,
      database: currentConnectionCtx.database,
      messageId: messageId,
      statement: value,
    });
  };

  return (
    <div className="w-full max-w-full relative font-sans text-[16px]">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="font-mono text-xs text-black dark:text-gray-300">{language}</span>
        <div className="flex items-center space-x-2">
          <Tooltip title={t("common.copy")} side="top">
            <button
              className="flex items-center justify-center w-6 h-6 p-1 text-xs text-white bg-gray-500 rounded bg-none opacity-70 hover:opacity-100"
              onClick={copyToClipboard}
            >
              <Icon.BiClipboard className="w-full h-auto" />
            </button>
          </Tooltip>
          {showExecuteButton && (
            <button
              className="flex items-center justify-center h-6 px-2 py-1 text-xs text-white bg-indigo-600 rounded bg-none opacity-90 hover:opacity-100"
              onClick={handleExecuteQuery}
            >
              <Icon.FiPlay className="mr-1" />
              {t("common.run-sql")}
            </button>
          )}
        </div>
      </div>
      <SyntaxHighlighter
        language={language.toLowerCase()}
        wrapLongLines={wrapLongLines || false}
        style={oneDark}
        customStyle={{ margin: 0 }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};
