import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({path: './config.env'});

// Connect to mongoDB database
mongoose.connect(process.env.CONN_STRING);

// Connection state
const db = mongoose.connection;

// Checking DB Connection
db.on('connected', () => {
    console.log('DB Connection Successful');
})

db.on('err', () => {
    console.log('DB Connection Failed!'); 
})

export default db;