const mongoose  = require('mongoose')

const messageSchema = new mongoose.Schema(
    {
        chat:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'chat',
            required: true,
        },
        content:{
            type:String,
            required: true,
        },
        role:{
            type: String,
            enum : ['user','ai'],
            required: true,
        },
    },
    { timestamps: true }
)

const messageModel = mongoose.model('Message', messageSchema)

module.exports = messageModel