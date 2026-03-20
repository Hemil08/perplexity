import { generateChatTitle, generateResponse } from "../services/ai.service.js"

export  async function sendMessage(req, res){
    const { message } = req.body

    const title = await generateChatTitle(message)

    const result = await generateResponse(message)

    res.json({
        aiMessage: result,
        title
    })
}