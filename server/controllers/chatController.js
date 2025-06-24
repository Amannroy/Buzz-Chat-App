import express from 'express';
import { middlewareAuth } from "../middlewares/authMiddleware.js";
import { chatModel } from "../models/chat.js";
import { messageModel } from '../models/message.js';

const router = express.Router();

router.post('/create-new-chat', middlewareAuth, async (req, res) => {
    try{
        const chat = new chatModel(req.body);
        const savedChat = await chat.save();

        await savedChat.populate('members');

        res.status(201).send({
            message: 'Chat created successfully',
            success: true,
            data: savedChat
        })
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

// Get the chats whose members array contains the user id of the currently logged in user(We want to fetch all those chats and return that in the response)
router.get('/get-all-chats', middlewareAuth, async (req, res) => {
    try{
        const allChats = await chatModel.find({members: {$in: [req.user.userId] }})
        .populate('members').populate('lastMessage').sort({updatedAt: -1});
        

        res.status(200).send({
            message: 'Chats fetched successfully',
            success: true,
            data: allChats
        })
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

router.post('/clear-unread-message', middlewareAuth, async(req, res) => {
    try{
        const chatId = req.body.chatId;

        // We want to update the unread message count in chat collection
        const chat = await chatModel.findById(chatId);
        if(!chat){
            res.send({
                message: "No Chat found with given chat Id",
                success: false
            })
        }

        const updatedChat = await chatModel.findByIdAndUpdate(
            chatId,
             {unreadMessageCount: 0}, 
             {new: true}
        ).populate('members').populate('lastMessage');

        // We want to update the read propery to true in message controller
        await messageModel.updateMany(
        {chatId: chatId, read: false},
        {read: true})
        res.send({
            message: "Unread message cleared successfully",
            success: true,
            data: updatedChat
        })
    }catch(error){
        res.send({
            message: error.message,
            success: false
        })
    }
})

export default router;