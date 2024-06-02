// This file defines several models for the GPT-3 and GPT-4 AI models, including their names, temperature, frequency penalty, presence penalty, maximum tokens, and cost per call. It also exports a function to retrieve a model by its name, defaulting to "gpt-3.5-turbo" if the specified model is not found.
const gpt35turbo = {
  name: "gpt-3.5-turbo",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 4000,
  cost_per_call: 1,
};

const gpt4 = {
  name: "gpt-4",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 8000,
  cost_per_call: 60,
};

const gpt4turbo = {
  name: "gpt-4-turbo",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 4000,
  cost_per_call: 20,
};

const gpt4ho = {
  name: "gpt-4o",
  temperature: 0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_token: 4000,
  cost_per_call: 10,
};

export const models = [gpt35turbo, gpt4, gpt4turbo, gpt4ho];

export const getModel = (name: string) => {
  for (const model of models) {
    if (model.name === name) {
      return model;
    }
  }
  return gpt35turbo;
};
