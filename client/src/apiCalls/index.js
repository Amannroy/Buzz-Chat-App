import axios from "axios";

export const url = "https://buzz-chat-app-server.onrender.com";

export const axiosInstance = axios.create({
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}` // We are reading the JSON web token from the local storage and we are passing it with this authorization header
    }
});