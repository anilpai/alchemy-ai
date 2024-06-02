import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { NextRequest } from "next/server";
import { openAIApiEndpoint, openAIApiKey, openAIOrganization, getModel } from "@/utils";

// Needs Edge for streaming response.
export const config = {
  runtime: "edge",
};

const getApiEndpoint = (apiEndpoint: string) => {
  const url = new URL(apiEndpoint);
  url.pathname = "/v1/chat/completions";
  return url;
};

const handler = async (req: NextRequest) => {
  const reqBody = await req.json();
  const apiKey = req.headers.get("x-openai-key") || openAIApiKey;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: {
          message: "OpenAI API Key is missing. You can supply your own key via [Setting](/setting).",
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 401,
      }
    );
  }

  let headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (openAIOrganization) {
    headers["OpenAI-Organization"] = openAIOrganization;
  }

  const apiEndpoint = getApiEndpoint(req.headers.get("x-openai-endpoint") || openAIApiEndpoint);
  const model = getModel(req.headers.get("x-openai-model") || "");
  const remoteRes = await fetch(apiEndpoint, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: model.name,
      messages: reqBody.messages,
      temperature: model.temperature,
      frequency_penalty: model.frequency_penalty,
      presence_penalty: model.presence_penalty,
      stream: true,
      // Send end-user IP to help OpenAI monitor and detect abuse.
      user: req.ip,
    }),
  });
  if (!remoteRes.ok) {
    return new Response(remoteRes.body, {
      status: remoteRes.status,
      statusText: remoteRes.statusText,
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };
      const parser = createParser(streamParser);
      for await (const chunk of remoteRes.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
};

export default handler;
