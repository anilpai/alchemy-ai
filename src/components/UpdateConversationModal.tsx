import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useConversationStore } from "@/store";
import { Conversation } from "@/types";
import TextField from "./ui/TextField";
import Modal from "./ui/Modal";

interface Props {
  conversation: Conversation;
  close: () => void;
}

const UpdateConversationModal = (props: Props) => {
  const { close, conversation } = props;
  const { t } = useTranslation();
  const conversationStore = useConversationStore();
  const [title, setTitle] = useState(conversation.title);
  const [assistantId, setAssistantId] = useState(conversation.assistantId);
  const allowSave = title !== "";

  const handleSaveEdit = () => {
    const formatedTitle = title.trim();
    if (formatedTitle === "") {
      return;
    }

    conversationStore.updateConversation(conversation.id, {
      title: formatedTitle,
      assistantId: assistantId,
    });
    toast.success("Conversation updated");
    close();
  };

  return (
    <Modal title={t("conversation.update")} onClose={close}>
      <div className="flex flex-col items-start justify-start w-full mt-2">
        <label className="block mb-1 text-sm font-medium text-gray-700">{t("conversation.title")}</label>
        <TextField placeholder={t("conversation.conversation-title") || ""} value={title} onChange={(value) => setTitle(value)} />
      </div>
      <div className="flex flex-row items-center justify-end w-full mt-4 space-x-2">
        <button className="btn btn-outline" onClick={close}>
          {t("common.close")}
        </button>
        <button className="btn" disabled={!allowSave} onClick={handleSaveEdit}>
          {t("common.save")}
        </button>
      </div>
    </Modal>
  );
};

export default UpdateConversationModal;
