import React from "react";
import { useTranslation } from "react-i18next";
import ClearDataButton from "./ClearDataButton";
import LocaleSelector from "./LocaleSelector";
import ThemeSelector from "./ThemeSelector";
import OpenAIApiConfigView from "./OpenAIApiConfigView";

const SettingGeneralView = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start justify-start w-full py-4 space-y-2 sm:space-y-4 sm:py-8">
      <OpenAIApiConfigView />

      <div className="w-full p-4 space-y-2 border border-gray-200 rounded-lg dark:border-zinc-700">
        <div className="flex flex-row items-center justify-between w-full gap-2">
          <span>{t("setting.basic.language")}</span>
          <LocaleSelector />
        </div>
        <div className="flex flex-row items-center justify-between w-full gap-2">
          <span>{t("setting.theme.self")}</span>
          <ThemeSelector />
        </div>
      </div>

      <div className="w-full p-4 border border-red-200 rounded-lg dark:border-zinc-700">
        <div className="flex flex-row items-center justify-between w-full gap-2">
          <span>{t("setting.data.clear-all-data")}</span>
          <ClearDataButton />
        </div>
      </div>
    </div>
  );
};

export default SettingGeneralView;
