import { initializeSocketConnection } from "../service/chat.socket.js";
import { sendMessage, getChats, deleteChat, getMessages } from "../service/chat.api.js";
import { setChats, setCurrentChatId, setError, setLoading, addMessages, addNewMessage, createNewChat} from "../chat.slice.js";
import { useDispatch } from "react-redux";

export const useChat = () => {

    const dispatch = useDispatch()

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

        dispatch(addNewMessage({
            chatId:chatId || chat._id,
            content: aiMessage.content,
            role: aiMessage.role,
        }))


        dispatch(setCurrentChatId(chat._id))

        dispatch(setLoading(false))
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