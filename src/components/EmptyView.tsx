import { useConversationStore, useConnectionStore, useMessageStore } from "@/store";
import Icon from "./Icon";

// examples are used to show some examples to the user.
const examples = ["Give me an example schema about employee", "How to create a view in PostgreSQL?"];

interface Props {
  className?: string;
  sendMessage: (content: string) => Promise<void>;
}

const EmptyView = (props: Props) => {
  const { className, sendMessage } = props;
  const connectionStore = useConnectionStore();
  const conversationStore = useConversationStore();

  const handleExampleClick = async (content: string) => {
    let conversation = conversationStore.getConversationById(conversationStore.currentConversationId);
    if (!conversation) {
      const currentConnectionCtx = connectionStore.currentConnectionCtx;
      if (!currentConnectionCtx) {
        conversation = conversationStore.createConversation();
      } else {
        conversation = conversationStore.createConversation(currentConnectionCtx.connection.id, currentConnectionCtx.database?.name);
      }
    }
    await sendMessage(content);
  };

  return (
    <div className={`${className || ""} w-full h-full flex flex-col justify-start items-center`}>
      <div className="max-w-full mb-8 font-medium leading-loose w-96">
        <img src={"/banner.png"} alt="ask-ai-logo" />
      </div>
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex flex-col items-center justify-start w-full">
          <Icon.BsSun className="w-8 h-auto opacity-80" />
          <span className="mt-2 mb-4">Examples</span>
          {examples.map((example) => (
            <div
              key={example}
              className="w-full px-4 py-3 mb-4 text-sm rounded-lg cursor-pointer bg-gray-50 dark:bg-zinc-700 hover:opacity-80"
              onClick={() => handleExampleClick(example)}
            >
              {`"${example}"`} →
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-start w-full">
          <Icon.BsLightning className="w-8 h-auto opacity-80" />
          <span className="mt-2 mb-4">Capabilities</span>
          <div className="w-full px-4 py-3 mb-4 text-sm rounded-lg bg-gray-50 dark:bg-zinc-700">
            Remembers what user said earlier in the conversation
          </div>
          <div className="w-full px-4 py-3 mb-4 text-sm rounded-lg bg-gray-50 dark:bg-zinc-700">
            Allows user to provide follow-up corrections
          </div>
        </div>
        <div className="flex-col items-center justify-start hidden w-full sm:flex">
          <Icon.BsEmojiNeutral className="w-8 h-auto opacity-80" />
          <span className="mt-2 mb-4">Limitations</span>
          <div className="w-full px-4 py-3 mb-4 text-sm rounded-lg bg-gray-50 dark:bg-zinc-700">
            May occasionally generate incorrect information
          </div>
          <div className="w-full px-4 py-3 mb-4 text-sm rounded-lg bg-gray-50 dark:bg-zinc-700">
            May occasionally produce harmful instructions or biased content
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyView;
