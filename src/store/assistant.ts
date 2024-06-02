import { first } from "lodash-es";
import { Assistant, Id } from "@/types";
import * as customAssistantList from "../../assistants";

// This file defines the chat bot and assistant functionalities. It exports a constant `chatBotId` which represents the ID of the chat bot. It also exports an array `assistantList` which contains all the assistants. The `getAssistantById` function retrieves an assistant by its ID, defaulting to the first assistant in the list if the specified ID is not found. The `getPromptGeneratorOfAssistant` function retrieves the prompt generator function of a given assistant.

export const chatBotId = "chat-bot";

export const assistantList: Assistant[] = Object.keys(customAssistantList).map((name) => {
  return {
    ...((customAssistantList as any)[name].default as Assistant),
  };
});

export const getAssistantById = (id: Id) => {
  const assistant = assistantList.find((assistant) => assistant.id === id);
  return assistant || (first(assistantList) as Assistant);
};

export const getPromptGeneratorOfAssistant = (assistant: Assistant) => {
  return assistant.getPrompt;
};
