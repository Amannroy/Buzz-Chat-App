import express from 'express';
import { userModel } from '../models/user.js';
import bcrypt from 'bcryptjs';
import  jwt  from 'jsonwebtoken';


const router = express.Router();

// Signup Route
router.post('/signup', async(req, res) => {
     try{
        //1. If the user already exists
        const user = await userModel.findOne({email: req.body.email});

        //2. If user exists. send an error response
        if(user){
            return res.send({
            message: 'User already exist.',
            success: false
          })
        }
        
        //3. Encrypt the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        //4. Create new user, save in DB
        const newUser = new userModel(req.body);
        await newUser.save();

        res.send({
            message: 'User created successfully',
            success: true
        })

     }catch(error){
         res.send({
            message: error.message,
            success: false
         })
     }
})

// Login Route
router.post('/login', async(req, res) => {
   try{
     //1. Check if user exists
     const user = await userModel.findOne({email: req.body.email}); 

     if(!user){
      return res.send({
        message: 'User does not exist',
        success: false
      })  
     }
     //2. Check if the password is correct
      const isValid = await bcrypt.compare(req.body.password, user.password);
      if(!isValid){
        return res.send({
            message: 'Invalid password',
            success: false
        })
      }

     //3. If the user exists & password is correct, assign a JWT
     const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {expiresIn: "1d"})
    
     res.send({
        message: "User logged-in successfully",
        success: true,
        token: token
     })
   }catch(error){
     res.send({
        message: error.message,
        success: false
     })
   }
})



export default router;