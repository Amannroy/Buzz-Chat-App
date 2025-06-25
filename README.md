# 💬 Buzz Chat App

A full-stack real-time chat application built using the **MERN stack (MongoDB, Express, React, Node.js)** and **Socket.IO**. This app enables live one-on-one conversations, real-time typing indicators, and user presence tracking — all inside a modern, responsive UI.

---

## 📸 Live Demo

🚀 [Open the Live App](https://buzz-chat-app-client.onrender.com)

---

## ✨ Features

- 🔐 User Authentication (Register & Login)
- 💬 Real-time Messaging with Socket.IO
- ✅ Online/Offline Status Display
- ✍️ Typing Indicators
- 🔁 Redux for State Management
- 📦 MongoDB for persistent message & user storage
- 📱 Responsive Frontend UI
- ☁️ Deployed on Render (both Client & Server)

---

## 🧰 Tech Stack

| Part       | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | React, Redux, CSS, Socket.IO Client  |
| Backend    | Node.js, Express                     |
| Real-Time  | WebSocket via Socket.IO              |
| Database   | MongoDB + Mongoose                   |
| Auth       | JWT (JSON Web Tokens)                |
| Deployment | Render (for both frontend & backend) |

---

## 📞 WebSocket in Simple Terms

> Imagine WebSocket as a **walkie-talkie** 🎙️ — once connected, you and your friend can talk **live** without asking “any updates?” again and again.

Without WebSocket:

- The app must keep checking every few seconds for new messages (polling).

With WebSocket:

- A live connection is opened between browser and server.
- As soon as a message is sent, it's **instantly delivered** to the other user.
- Used for real-time chat, typing status, and online users.

In this app:

- Users join a private room using `socket.join(userId)`
- Messages are sent to both users via `io.to(...).emit(...)`
- Typing and presence are shared instantly

---

## ⚙️ Setup Instructions

### 1️⃣ Backend (Node.js + Express)

cd server
npm install
npx nodemon server.js

Runs on: http://localhost:5000


###2️⃣Frontend (React + Redux)

cd client
npm install
npm start

Runs on: http://localhost:3000

🔐
### Environment Variables
Create a .env file inside the /server folder:


PORT_NUMBER=5000
CONN_STRING=your_mongodb_connection_url
SECRET_KEY=your_jwt_secret
🔒
Make sure .env is listed in .gitignore to keep credentials private.


Buzz-Chat-App/
├── client/               # React frontend
│   ├── components/       # Reusable UI parts
│   ├── pages/            # Screens like Login, Chat
│   └── redux/            # State management
├── server/               # Express backend
│   ├── controllers/      # Auth, Chat, Message APIs
│   ├── middleware/       # JWT verification
│   ├── models/           # Mongoose schemas
│   ├── app.js            # Main app + WebSocket logic
│   └── server.js         # Entry point for backend



🧠 Learning Outcomes

✅ Understand the MERN stack workflow

✅ Build real-time communication with WebSocket (Socket.IO)

✅ Manage global state using Redux

✅ Use JWT for authentication & route protection

✅ Deploy full-stack apps using Render


 Testing Tip
Want to test chat in real-time?
🧪 Open your app in two incognito windows or separate browsers and chat with yourself!


```
