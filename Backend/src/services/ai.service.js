import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatMistralAI} from "@langchain/mistralai"
import {HumanMessage, SystemMessage} from "langchain"

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY
})



export async function generateResponse(message){
    const response = await geminiModel.invoke([
        new HumanMessage(message)
    ])

    return response.text
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