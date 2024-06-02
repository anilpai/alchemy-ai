import { useTranslation } from "react-i18next";
import Link from "next/link";
import Tooltip from "./ui/Tooltip";
import Icon from "./Icon";

const SettingAvatarIcon = () => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t("common.setting")} side="right">
      <div>
        {
          <Link
            className="flex flex-row items-center justify-center w-10 h-10 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
            data-tip={t("common.setting")}
            href="/setting"
          >
            <Icon.IoMdSettings className="w-6 h-auto text-gray-600 dark:text-gray-300" />
          </Link>
        }
      </div>
    </Tooltip>
  );
};

export default SettingAvatarIcon;
