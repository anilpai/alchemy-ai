import { encode } from "@nem035/gpt-3-encoder";
import { Engine, Schema, Table } from "@/types";

// openAIApiKey represents the API key used for OpenAI's API.
export const openAIApiKey = process.env.OPENAI_API_KEY;

// openAIApiEndpoint refers to the OpenAI API endpoint. It defaults to https://api.openai.com.
export const openAIApiEndpoint = process.env.OPENAI_API_ENDPOINT || "https://api.openai.com";

// openAIOrganization is a header that determines the organization used for an API request.
export const openAIOrganization = process.env.OPENAI_ORGANIZATION;

export const countTextTokens = (text: string) => {
  return encode(text).length;
};

export function generateDbPromptFromContext(
  promptGenerator: (engine: Engine | undefined, schema: string | undefined) => string,
  engine: Engine,
  schemaList: Schema[],
  selectedSchemaName: string,
  selectedTableNameList: string[],
  maxToken: number,
  userPrompt?: string
): string {
  // userPrompt is the message that user want to send to bot.
  let tokens = countTextTokens(userPrompt || "");

  // An empty table name (like []) no longer represents all tables. Previously, both [] and `undefined` were false in `if` conditions, but now [] is true. We've changed this behavior because we've introduced custom token numbers in the connectionSidebar. If [] still represented all tables, it would lead to inconsistencies in the token count.
  const tableList: string[] = [];
  const selectedSchema = schemaList.find((schema: Schema) => schema.name == (selectedSchemaName || ""));
  if (selectedTableNameList) {
    selectedTableNameList.forEach((tableName: string) => {
      const table = selectedSchema?.tables.find((table: Table) => table.name == tableName);
      tableList.push(table!.structure);
    });
  } else {
    for (const table of selectedSchema?.tables || []) {
      tableList.push(table!.structure);
    }
  }

  let finalTableList = [];
  if (tableList) {
    for (const table of tableList) {
      if (tokens < maxToken / 2) {
        tokens += countTextTokens(table + "\n\n");
        finalTableList.push(table);
      }
    }
  }
  return promptGenerator(engine, finalTableList.join("\n\n"));
}

export function allowSelfOpenAIKey() {
  return process.env.NEXT_PUBLIC_ALLOW_SELF_OPENAI_KEY == "true";
}
