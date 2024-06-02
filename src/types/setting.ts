export type Locale = "en" | "kn";

export type Theme = "light" | "dark" | "system";

export interface OpenAIApiConfig {
  key: string;
  endpoint: string;
  model: string;
}

export interface Setting {
  locale: Locale;
  theme: Theme;
  openAIApiConfig: OpenAIApiConfig;
}
