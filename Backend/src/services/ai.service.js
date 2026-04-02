import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI, MistralAI } from "@langchain/mistralai";
import {
  AIMessage,
  createAgent,
  HumanMessage,
  SystemMessage,
  tool,
} from "langchain";
import { searchInternet } from "./internet.service.js";
import * as z from "zod";
import { finalize } from "zod/v4/core";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const searchInternetTool = tool(searchInternet, {
  name: "searchInternet",
  description: "Use this tool to get the latest information from the internet.",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

const agent = createAgent({
  model: mistralModel,
  tools: [searchInternetTool],
});

export async function generateResponse(messages, handlers) {
    const { onToken, onToolCall, onEnd, onError } = handlers;

    let response = null
    let previousContent = "";

    try {
    response = await agent.stream(
        {
        messages: [
            new SystemMessage(`
                            You are a helpful and pracise assistant for answering questions.
                            If you don't know the answer, say you don't know.
                            If the question requires up-to-date information, use the "searchInternet" tool to get the latest 
                            information from the internet and then answer based on the search results.
                            `),
            ...messages.map((msg) => {
            if (msg.role == "user") {
                return new HumanMessage(msg.content);
            } else if (msg.role == "ai") {
                return new AIMessage(msg.content);
            }
            }),
        ],
        },
        { streamMode: "values" },
    );

    for await (const chunk of response) {
        const latestMessage = chunk.messages?.at(-1);
        if (!latestMessage) continue;

        // Stream text tokens
        if (latestMessage.content) {
        let text = "";

        if (typeof latestMessage.content === "string") {
            text = latestMessage.content;
        } else if (Array.isArray(latestMessage.content)) {
            text = latestMessage.content.map((c) => c?.text || "").join("");
        }

        // Only emit new tokens (avoid sending accumulated content)
        if (text.length > previousContent.length) {
            const newToken = text.slice(previousContent.length);
            previousContent = text;
            onToken?.(newToken);
        }
        }

        // Optional: stream tool call events
        if (latestMessage.tool_calls) {
        onToolCall?.(latestMessage.tool_calls.map((tc) => tc.name));
        }
    }

    onEnd?.()

    } catch (err) {
        onError?.(err)
    }

    return response
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
            You are a helpful and precise assistant for answering questions.
            If you don't know the answer, say you don't know. 
            If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.`),
    new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"    
        `),
  ]);

  return response.text;
}
