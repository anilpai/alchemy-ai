import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Modal from "./ui/Modal";

interface Props {
  close: () => void;
}

const ClearDataConfirmModal = (props: Props) => {
  const { close } = props;
  const { t } = useTranslation();

  const handleClearData = () => {
    window.localStorage.clear();
    close();
    toast.success("Data cleared. The page will be reloaded.");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Modal title="Clear all data" className="!w-96" onClose={close}>
      <div>
        <div className="flex flex-col items-start justify-start w-full mt-2">
          <p className="text-gray-500">Alchemy AI saves all your data in your local browser. Are you sure to clear all of them?</p>
        </div>
        <div className="flex flex-row items-center justify-end w-full mt-4 space-x-2">
          <button className="btn btn-outline" onClick={close}>
            {t("common.close")}
          </button>
          <button className="btn btn-error" onClick={handleClearData}>
            {t("common.clear")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ClearDataConfirmModal;
