import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
            chatId: {
            type: mongoose.Schema.Types.ObjectId, ref: "chats"

            },
            sender: {
                type: mongoose.Schema.Types.ObjectId, ref: "users"
            },
            text: {
                type: String,
                required: false
            },
            image: {
                type: String,
                required: false
            },
            read: {
                type: Boolean,
                default: false
            }
        }, {timestamps: true}
    );


export const messageModel = mongoose.model("messages", messageSchema);