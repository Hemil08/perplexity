import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null,
    },
    reducers: {

        createNewChat: (state, action) => {
            const {chatId, title} = action.payload
            state.chats[chatId] = {
                id: chatId,
                title,
                messages: [],
                lastUpload: new Date().toISOString(),
            }
        },

        addNewMessage: (state,action) => {
            const { chatId, messageId,content, role } = action.payload
            state.chats[ chatId ].messages.push({ messageId,content, role })
        },

        updateMessage: (state,action) => {
            const {chatId, messageId, token} = action.payload

            const messages = state.chats[chatId]?.messages
            if(!messages) return 

            const msg = messages.find(m => m.messageId === messageId)
            if(msg){
                msg.content += token
            }
        },

        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            state.chats[chatId].messages.push(...messages) 
        },
        
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        }
    }
})


export const { createNewChat,setChats, setCurrentChatId, setLoading, addMessages, updateMessage, addNewMessage, setError   } = chatSlice.actions
export default chatSlice.reducer