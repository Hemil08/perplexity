import { initializeSocketConnection } from "../service/chat.socket.js";
import { sendMessage, getChats, deleteChat, getMessages } from "../service/chat.api.js";
import { setChats, setCurrentChatId, setError, setLoading, addMessages, updateMessage,addNewMessage, createNewChat} from "../chat.slice.js";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useRef } from "react";

export const useChat = () => {

    const dispatch = useDispatch()
    const socketRef = useRef(null)
    const chats = useSelector(state => state.chat.chats)

    useEffect(()=>{

        const socket = initializeSocketConnection();
        socketRef.current = socket;


        socket.on("ai_message_created",({ chatId, messageId, content }) =>{
            dispatch(addNewMessage({
                chatId,
                messageId,
                content: content || "",
                role:"ai"
            }))
        })

        socket.on("token",({ chatId, token, messageId }) =>{
            dispatch(updateMessage({
                chatId,
                messageId,
                token
            }))
        })

        socket.on("done",({ chatId, messageId }) => {
            dispatch(setLoading(false))

        })

        socket.on("error",(err)=> {
            dispatch(setLoading(false))
            dispatch(setError(err))
        })

        return () => {
            socket.off("ai_message_created");
            socket.off("token");
            socket.off("done");
            socket.off("error");
        }
    },[])



    async function handleSendMessage( {message,chatId} ){
        dispatch(setLoading(true))

        try{
            const data = await sendMessage({ message, chatId })

        const {chat} = data

        if(!chatId)
            dispatch(createNewChat({
                chatId: chat._id,
                title: chat.title,
            }))
        

        dispatch(addNewMessage({
            chatId:chatId || chat._id,
            messageId: crypto.randomUUID(),
            content: message,
            role: "user",
        }))

        dispatch(setCurrentChatId(chatId || chat._id))

        const socket = socketRef.current

        socket.emit("chat",{
            chatId: chatId || chat._id,
            messages:[
                {role: "user", content: message }
            ]
        })
        } catch(error){
            dispatch(setLoading(false))
            dispatch(setError("Failed to send message"))
        }        
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
                messageId: msg._id,
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
        handleOpenChat,
        socketRef
    }
}