import {Server} from "socket.io"
import { generateResponse } from "../services/ai.service.js"
import messageModel from "../models/message.model.js"

let io

export function initSocket(httpServer){
    io = new Server(httpServer,{
        cors:{
            origin: "http://localhost:5173",
            credentials: true,
        }
    })

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) =>{
        console.log("A user connected: " + socket.id)

        socket.on("chat", async ({messages, chatId}) => {

            let aiMessageDoc

            try{
                 // Create empty AI message in DB first
                aiMessageDoc = await messageModel.create({
                    chat: chatId,
                    content: " ",
                    role: "ai"
                });      

                socket.emit("ai_message_created", {
                    chatId,
                    messageId: aiMessageDoc._id,
                });

                let fullContext = ""


                await generateResponse(messages, {
                onToken : (token) => {
        
                    fullContext += token
                    socket.emit("token",{chatId, token, messageId:aiMessageDoc._id})
                },
                onToolCall: (tools) => {
                    socket.emit("tool_call",{ tools })
                },
                onEnd: async () => {
                   
                    aiMessageDoc.content = fullContext
                    await aiMessageDoc.save()

                    socket.emit("done",{chatId, messageId:aiMessageDoc._id})
                },
                onError: () => {
                    socket.emit("error", "Streaming failed")
                }
                })
            } catch(err){
                 console.error("Socket chat error:", err);
                socket.emit("error",{ chatId, message: "Server error"});
            }
            
        })
    })
}


export function getId(){
    if(!io){
        throw new Error("Socket.io not initialized")
    }

    return io
}