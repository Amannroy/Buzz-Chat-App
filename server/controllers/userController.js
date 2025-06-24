import express from 'express';
const router = express.Router();
import { middlewareAuth } from '../middlewares/authMiddleware.js';
import { userModel } from '../models/user.js';
import cloudinary from '../cloudinary.js';


// Get details of current logged-in user
router.get('/get-logged-user', middlewareAuth, async(req, res) => {
    try{
        const user = await userModel.findOne({_id: req.user.userId});

        res.send({
            message: 'User fetched successfully',
            success: true,
            data: user
        });
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

// Getting all the users from the database except the currently logged in user
router.get('/get-all-users', middlewareAuth, async(req, res) => {
    try{
        const userid = req.user.userId;
        const allUsers = await userModel.find({_id: {$ne: userid}});

        res.send({ 
            message: 'All users fetched successfully',
            success: true,
            data: allUsers
        });
    }catch(error){
        res.status(400).send({
            message: error.message,
            success: false
        })
    }
})

router.post('/upload-profile-pic', middlewareAuth, async(req, res) => {
    try{
        const image = req.body.image;

        // UPLOAD THE IMAGE TO CLOUDINARY
        const uplaodedImage = await cloudinary.uploader.upload(image, {
            folder: 'Quick-Chat'  // Upload image to this folder in cloudinary
        });

        // UPDATE THE USER MODEL & SET THE PROFILE PIC PROPERLY
        const user = await userModel.findByIdAndUpdate(
            {_id: req.user.userId},
            {profilePic: uplaodedImage.secure_url},
            {new: true}
        );
        
        res.send({
            message: 'Profile picture uploaded successfully',
            success: true,
            data: user
        })
            
    }catch(error){
        res.send({
            message: error.message,
            succuss: false
        })
    }
})

export default router;