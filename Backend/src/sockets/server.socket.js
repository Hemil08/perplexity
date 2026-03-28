import {Server} from "socket.io"
import { generateResponse } from "../services/ai.service.js"

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

            try{
                 // Create empty AI message in DB first
                let aiMessageDoc = await messageModel.create({
                    chat: chatId,
                    content: "",
                    role: "ai"
                });       

                await generateResponse(messages, {
                onToken : async (token) => {
                    aiMessageDoc.content += token
                    await aiMessageDoc.save()
                    socket.emit("token",token)
                },
                onToolCall: (tools) => {
                    socket.emit("tool_call",{ tools })
                },
                onEnd: () => {
                    socket.emit("done")
                },
                onError: () => {
                    socket.emit("error", "Streaming failed")
                }
                })
            } catch(err){
                 console.error("Socket chat error:", err);
                socket.emit("error", "Server error");
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