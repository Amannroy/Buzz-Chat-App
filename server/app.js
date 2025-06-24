import express from "express";
const app = express();
import authRouter from "./controllers/authController.js";
import userRouter from "./controllers/userController.js";
import chatRouter from "./controllers/chatController.js";
import messageRouter from "./controllers/messageController.js";
import http from "http";
import { Server } from "socket.io"; // Create HTTP server ans socket.io instance
import cors from "cors";

// User auth controller routers(Middleware)
// app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000", // for local dev
    "https://buzz-chat-app-client.onrender.com" // ✅ for live client
  ],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));

// Server and Socket.io setup
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", // keep this for local testing
      "https://buzz-chat-app-client.onrender.com" // ✅ live client URL
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// This array will contain the user id of all the online users
const onlineUser = [];

// TEST SOCKET CONNECTION FROM CLIENT
io.on("connection", (socket) => {
  // Listening to join-room event and joining a socket room using the currently logged in userid
  socket.on("join-room", (userid) => {
    socket.join(userid);
  });

  socket.on("send-message", (message) => {
    // We want to send that message object to the user who has send the message and also to the user who has to receive the message
    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);

    io.to(message.members[0])
      .to(message.members[1])
      .emit("set-message-count", message);
  });

  socket.on("clear-unread-messages", (data) => {
    // We are going to raise a new event and that event should be raised only for the members of the chat
    io.to(data.members[0])
      .to(data.members[1])
      .emit("message-count-cleared", data);
  });

  socket.on("user-typing", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("started-typing", data);
  });

  socket.on("user-login", userId => {
    // If the user id which we are receiving with the event data. If it is already present in the onlineUser array then we dont want to do anything if that id is not present in the onlineUser array then we are going to push that userId in this onlineUser array.
    if (!onlineUser.includes(userId)) {
      onlineUser.push(userId);
    }
    // This event we want to raise for all the clients(We want to show online user to all the logged in users)
    socket.emit("online-users", onlineUser);
  });

  // onlineUser array keeps only those users whose _id is NOT equal to userId
  socket.on("user-offline", userId => {
    // We want to remove the userId from the onlineUser array(Filter all those users whose id does not match with the id which we have received with the event data)
    onlineUser.splice(onlineUser.indexOf(userId), 1);
    io.emit("online-users-updated", onlineUser);

    // onlineUser.filter(user => user._id !== userId);
    // io.emit('online-users-updated', onlineUser);
  });
});

export default server;
