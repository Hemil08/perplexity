import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatMistralAI, MistralAI} from "@langchain/mistralai"
import {AIMessage, createAgent, HumanMessage, SystemMessage, tool} from "langchain"
import { searchInternet } from "./internet.service.js";
import * as z from "zod"

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)

const agent = createAgent({
    model: mistralModel,
    tools: [ searchInternetTool ], 
})

export async function generateResponse(messages){

    const response = await agent.invoke({
        messages: [
            new SystemMessage(`
                You are a helpful and pracise assistant for answering questions.
                If you don't know the answer, say you don't know.
                If the question requires up-to-date information, use the "searchInternet" tool to get the latest 
                information from the internet and then answer based on the search results.
                `),
            ...(messages.map(msg => {
            if (msg.role == "user"){
                return new HumanMessage(msg.content)
            }else if(msg.role == "ai"){
                return new AIMessage(msg.content)
            }
        }))]
    })

    return response.messages [ response.messages.length - 1 ].text

}

export async function generateChatTitle(message){

    const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful and precise assistant for answering questions.
            If you don't know the answer, say you don't know. 
            If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.`
        ),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"    
        `)
    ])

    return response.text
 
}