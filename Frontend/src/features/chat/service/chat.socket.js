import { io } from "socket.io-client"

let socket

export const initializeSocketConnection = () => {

    if(!socket){
        socket = io("http://localhost:3000",{
            withCredentials:true,
        })

        socket.on("connect",() => {
        console.log("Connected to Socket.IO server",socket.id)
        })
    }
    
    return socket
}

export const getSocket = () => {
    if(!socket){
        throw new error("Socket not initialized")
    }
    return socket
}

