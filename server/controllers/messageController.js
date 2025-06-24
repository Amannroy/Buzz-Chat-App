import express from 'express';
import { middlewareAuth } from "../middlewares/authMiddleware.js";
import { messageModel } from '../models/message.js';
import { chatModel } from '../models/chat.js';

const router = express.Router();

router.post('/new-message', middlewareAuth, async(req, res) => {
    try{
        // Store the data in the database(message collection)
        const newMessage = new messageModel(req.body);
        const savedMessage = await newMessage.save();


        // Update the last message in chat collection
        // const currentChat = await chatModel.findById(req.body.chatId);
        // currentChat.lastMessage = savedMessage._id;
        // await currentChat.save();

        const currentChat = await chatModel.findOneAndUpdate({
            _id: req.body.chatId
        }, {
            lastMessage: savedMessage._id, 
            $inc: {unreadMessageCount: 1}
        });
        res.status(201).send({
            message: 'Message sent successfully',
            success: true,
            data: savedMessage
        })
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

// For the same chatId, give all the messaages
router.get('/get-all-messages/:chatId', middlewareAuth, async(req, res) => {
    try{
        const allMessages = await messageModel.find({chatId: req.params.chatId}).sort({createdAt: 1});
        res.send({
            message: 'Messages fetched successfully',
            success: true,
            data:  allMessages
        })
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

export default router;