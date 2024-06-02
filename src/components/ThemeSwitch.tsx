import { useSettingStore } from "@/store";
import Icon from "./Icon";

const ThemeSwitch = () => {
  const settingStore = useSettingStore();
  const theme = settingStore.setting.theme;

  const handleThemeChange = () => {
    if (theme === "light") {
      settingStore.setLocale("en");
    } else {
      settingStore.setLocale("kn");
    }
  };

  return (
    <button className="flex flex-row items-center justify-center w-10 h-10 p-1 rounded-full hover:bg-gray-100" onClick={handleThemeChange}>
      <Icon.IoSunny className="w-6 h-auto text-gray-600" />
    </button>
  );
};

export default ThemeSwitch;
