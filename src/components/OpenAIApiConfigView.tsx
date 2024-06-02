import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "react-use";
import { useSettingStore } from "@/store";
import { OpenAIApiConfig } from "@/types";
import { allowSelfOpenAIKey } from "@/utils";
import Radio from "./ui/Radio";
import TextField from "./ui/TextField";
import Tooltip from "./ui/Tooltip";

const OpenAIApiConfigView = () => {
  const { t } = useTranslation();
  const settingStore = useSettingStore();
  const [openAIApiConfig, setOpenAIApiConfig] = useState(settingStore.setting.openAIApiConfig);
  const [maskKey, setMaskKey] = useState(true);

  const models = [
    {
      id: "gpt-3.5-turbo",
      title: `GPT-3.5 Turbo`,
      cost: 1,
      disabled: false,
      tooltip: "",
    },
    {
      id: "gpt-4-turbo",
      title: `GPT-4 Turbo`,
      cost: 20,
      disabled: false,
      tooltip: "",
    },
    {
      id: "gpt-4",
      title: `GPT-4`,
      cost: 60,
      disabled: false,
      tooltip: "",
    },
    {
      id: "gpt-4o",
      title: `GPT-4o`,
      cost: 10,
      disabled: false,
      tooltip: "",
    },
  ];

  const maskedKey = (str: string) => {
    if (str.length < 7) {
      return str;
    }
    const firstThree = str.slice(0, 3);
    const lastFour = str.slice(-4);
    const middle = ".".repeat(str.length - 7);
    return `${firstThree}${middle}${lastFour}`;
  };

  useDebounce(
    () => {
      settingStore.setOpenAIApiConfig(openAIApiConfig);
    },
    300,
    [openAIApiConfig]
  );

  const handleSetOpenAIApiConfig = (config: Partial<OpenAIApiConfig>) => {
    setOpenAIApiConfig({
      ...openAIApiConfig,
      ...config,
    });
    setMaskKey(false);
  };

  const modelRadio = (model: any) => {
    return (
      <div key={model.id} className="flex items-center">
        <Radio
          value={model.id}
          disabled={model.disabled}
          checked={openAIApiConfig.model === model.id}
          onChange={(value) => handleSetOpenAIApiConfig({ model: value })}
        />
        <label htmlFor={model.id} className="block ml-3 text-sm font-medium leading-6 text-gray-900">
          {model.title}
        </label>
      </div>
    );
  };

  return (
    <>
      <div className="w-full p-4 border border-gray-200 rounded-lg dark:border-zinc-700">
        <div>
          <label className="text-base font-semibold ">{t("setting.openai-api-configuration.model")}</label>
          <fieldset className="mt-4">
            <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
              {models.map((model) =>
                model.disabled ? (
                  <Tooltip key={model.id} title={model.tooltip} side="top">
                    {modelRadio(model)}
                  </Tooltip>
                ) : (
                  modelRadio(model)
                )
              )}
            </div>
          </fieldset>
        </div>
        {allowSelfOpenAIKey() && (
          <>
            <div className="flex flex-col mt-4">
              <label className="text-base font-semibold">OpenAI API Key</label>
              <p className="text-sm text-gray-500">{t("setting.openai-api-configuration.key-description")}</p>
              <TextField
                className="mt-4"
                placeholder="OpenAI API Key"
                value={maskKey ? maskedKey(openAIApiConfig.key) : openAIApiConfig.key}
                onChange={(value) => handleSetOpenAIApiConfig({ key: value })}
              />
            </div>
            <div className="flex flex-col mt-4">
              <label className="text-base font-semibold">OpenAI API Endpoint</label>
              <div className="flex">
                <p className="text-sm text-gray-500">{t("setting.openai-api-configuration.endpoint-description")}</p>
                <a
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noopener"
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  {t("setting.openai-api-configuration.find-my-key")}
                </a>
              </div>
              <TextField
                className="mt-4"
                placeholder="API Endpoint"
                value={openAIApiConfig.endpoint}
                onChange={(value) => handleSetOpenAIApiConfig({ endpoint: value })}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OpenAIApiConfigView;
