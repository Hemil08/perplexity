import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat, createNewChat } from "../service/chat.api.js";
import { setChats, setCurrentChatId,setError, setLoading } from "../chat.slice.js";
import { useDispatch } from "react-redux";

export const useChat = () => {

    const dispatch = useDispatch()

    async function handleSendMessage( {message,chatId} ){
        dispatch(setLoading(true))

        const data = await sendMessage({ message, chatId })

        const {chat, aiMessage} = data

        dispatch(createNewChat({
            chatId: chat._id,
            title: chat.title,
        }))

        dispatch(addNewMessage({
            chatId:chat._id,
            title: chat.title,
            role: a"user",
        }))

        dispatch(addNewMessage({
            chatId:chat._id,
            title: chat.title,
            role: aiMessage.role,
        }))


        dispatch(setCurrentChatId(chat._id))
    }

    return {
        initializeSocketConnection,


    }
}