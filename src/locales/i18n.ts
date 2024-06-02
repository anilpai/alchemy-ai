import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLocale from "./en.json";
import knLocale from "./kn.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enLocale,
    },
    kn: {
      translation: knLocale,
    },
  },
  fallbackLng: "en",
});

export default i18n;
