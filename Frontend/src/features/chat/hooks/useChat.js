import { initializeSocketConnection } from "../service/chat.socket.js";
import { sendMessage, getChats, deleteChat, getMessages } from "../service/chat.api.js";
import { setChats, setCurrentChatId, setError, setLoading, addMessages, addNewMessage, createNewChat} from "../chat.slice.js";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";

export const useChat = () => {

    const dispatch = useDispatch()

    const socket = io("http://localhost:5173")

    async function handleSendMessage( {message,chatId} ){
        dispatch(setLoading(true))

        const data = await sendMessage({ message, chatId })

        const {chat, aiMessage} = data

        if(!chatId)
            dispatch(createNewChat({
                chatId: chat._id,
                title: chat.title,
            }))
        

        dispatch(addNewMessage({
            chatId:chatId || chat._id,
            content: message,
            role: "user",
        }))

        const aiMessageId = crypto.randomUUID()

        dispatch(addNewMessage({
            chatId:chatId || chat._id,
            messageId: aiMessageId,
            content: "",
            role: aiMessage.role,
        }))


        dispatch(setCurrentChatId(chat._id))

        socket.emit("chat",[
            { role: "user", content:message }
        ])

        socket.off("token")
        socket.on("token", (chunk) => {
            dispatch(updateMessage({
                chatId: chatId || chat._id,
                messageId: aiMessageId,
                content: chunk,
            }))
        })
        
        socket.off("tool_call")
        socket.on(tool_call, (data) => {
            console.log("Tools:",data.tools)
        })

        socket.off("done")
        socket.on("done", () => {
            dispatch(setLoading(false))
        })

        socket.off("error")
        socket.on("error", ()=>{
            dispatch(setLoading(false))
        })
    }

    async function handleGetChats(){
        dispatch(setLoading(true))

        const data = await getChats()
        const {chats} = data
        
        dispatch(setChats(chats.reduce((acc,chat) => {
            acc[ chat._id ] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdate: chat.updateAt,
            }
            return acc
        },{})))
        dispatch(setLoading(false))
    }    

    async function handleOpenChat(chatId, chats){

       

        if(chats[ chatId ]?.messages.length === 0){
             const data = await getMessages(chatId)
            const { messages } = data
        

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }   
        dispatch(setCurrentChatId(chatId))
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat
    }
}