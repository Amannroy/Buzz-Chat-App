import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import moment from "moment";
import { clearUnreadMessageCount } from "../../../apiCalls/chat";
import store from './../../../redux/store';
import { setAllChats } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react";


function ChatArea({ socket }) {
  const dispatch = useDispatch();
  const { selectedChat, user, allChats } = useSelector((state) => state.userReducer);
  const selectedUser = selectedChat.members.find((u) => u._id !== user._id);
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [data, setData] = useState(null);

  const sendMessage = async (image) => {
    try {
      const newMesssage = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
        image: image
      };
      
      // Sending this message from client
      socket.emit('send-message', {
        ...newMesssage,
        members: selectedChat.members.map(m => m._id),
        read: false,
        createdAt: moment().format('YYYY-MM-DD hh:mm:ss')
      })

      
      const response = await createNewMessage(newMesssage);
      

      if (response.success) {
        setMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      toast.error(error.messsage);
    }
  };

  const formatTime = (timestamp) => {
      const now = moment();
      const diff = now.diff(moment(timestamp), 'days');

      if(diff < 1){
        return `Today ${moment(timestamp).format('hh:mm A')}`;
      }else if(diff === 1){
         return `Yesterday ${moment(timestamp).format('hh:mm A')}`; 
      }else{
          return moment(timestamp).format('MMM D, hh:mm A');
      }
  }

  const getMessages = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllMessages(selectedChat._id);
      dispatch(hideLoader());

      if (response.success) {
        setAllMessages(response.data);
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.messsage);
    }
  };

  const clearUnreadMessages = async () => {
    try {
      socket.emit('clear-unread-messages', {
        chatId : selectedChat._id,
        members: selectedChat.members.map(m => m._id)
      })
      const response = await clearUnreadMessageCount(selectedChat._id);

      if (response.success) {
        allChats.map(chat => {
          // We only want to change that chat for which we have updated the chat document and the message document in the mongodb database so that chat we are selecting using the chatid
            if(chat._id === selectedChat._id){
                return response.data;
            }
            return chat;
        })
      }
    } catch (error) {
      toast.error(error.messsage);
    }
  };

  function formatName(user){
    //console.log(user);
    
    let fname = user.firstName.at(0).toUpperCase() + user.firstName.slice(1).toLowerCase();
    let lname = user.lastName.at(0).toUpperCase() + user.lastName.slice(1).toLowerCase();
    return fname + ' ' + lname;
  }

  const sendImage = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);
        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            sendMessage(reader.result);
        }
    }

  useEffect(() => {
    getMessages();
    if(selectedChat?.lastMessage?.sender !== user._id){
      clearUnreadMessages();
    }
    // Before adding an event listener for receive-message event we are removing any event listener which is already prevent for this even on the socket object
    socket.off('receive-message').on('receive-message', (message) => {
         const selectedChat = store.getState().userReducer.selectedChat;
         if(selectedChat._id === message.chatId){
              setAllMessages(prevmsg => [...prevmsg, message]);
         }

         if(selectedChat._id === message.chatId && message.sender !== user._id){
              clearUnreadMessages();
         }
       
         
    })

    socket.on('message-count-cleared', data => {
       const selectedChat = store.getState().userReducer.selectedChat;
       const allChats = store.getState().userReducer.allChats;

       if(selectedChat._id === data.chatId){
        // UPDATING THE UNREAD MESSAGE COUNT IN CHAT OBJECT
        const updatedChats = allChats.map(chat => {
          // If chat._id is equal to the chat id which we are receiving in the data then return a new chat object and there set unread message count to 0
          if(chat._id === data.chatId){
               return {...chat, unreadMessageCount: 0}
          }
          return chat;
        })
        dispatch(setAllChats(updatedChats));

        // UPDATING THE READ PROPERTY IN MESSAGE OBJECT
        setAllMessages(prevMsgs => {
          return prevMsgs.map(msg => {
            return {...msg, read: true}
          })
        })
       }

    })

    socket.on('started-typing', (data) => {
      setData(data);
      // Show typing message to the user who is going to receive the message
         if(selectedChat._id === data.chatId && data.sender !== user._id){
          setIsTyping(true);
          setTimeout(() => {
             setIsTyping(false);
          }, 2000);
         }
    })
  }, [selectedChat]);

  useEffect(() => {
      const msgContainer = document.getElementById('main-chat-area');
      msgContainer.scrollTop = msgContainer.scrollHeight;
  }, [allMessages, isTyping]);

  return (
    <>
      {selectedChat && (
        <div className="app-chat-area">
          <div className="app-chat-area-header">
            {/* <!--RECEIVER DATA--> */}
            {formatName(selectedUser)}
          </div>

          <div className="main-chat-area" id="main-chat-area">
            {allMessages.map((msg) => {
              const isCurrentUserSender = msg.sender === user._id;

              /* <!--Chat Area--> */
              return (
                <div
                  className="message-container"
                  style={
                    isCurrentUserSender
                      ? { justifyContent: "end" }
                      : { justifyContent: "start" }
                  }
                >
                  <div>
                    <div
                      className={
                        isCurrentUserSender
                          ? "send-message"
                          : "received-message"
                      }
                    >
                     <div> {msg.text} </div>
                     <div>{msg.image && <img src={msg.image} alt="image" height="120" width="120"></img>}</div>
                    </div>
                    <div className="message-timestamp" style={isCurrentUserSender ? {float: 'right'} : {float: 'left'}}>{formatTime(msg.createdAt)} {isCurrentUserSender && msg.read && 
                      <i className="fa fa-check-circle" aria-hidden="true" style={{color: 'rgb(153, 41, 245)'}}></i>}</div>
                  </div>
                </div>
              );
            })}
            <div className="typing-indicator">{isTyping &&  selectedChat?.members.map(m => m._id).includes(data?.sender) && <i>typing...</i>}</div>
          </div>
          
          {showEmojiPicker && <div tyle={{width: '100%', display: 'flex', padding: '0px 20px', justifyContent: 'right'}}>
            <EmojiPicker onEmojiClick={(e) => setMessage(message + e.emoji)}></EmojiPicker>
          </div>}
          
          {/* <!--SEND MESSAGE--> */}
          <div class="send-message-div">
            <input
              type="text"
              className="send-message-input"
              placeholder="Type a message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                socket.emit('user-typing', {
                   chatId: selectedChat._id, 
                   members: selectedChat.members.map(m => m._id),
                   sender: user._id
              })
            }
          }
            />
            <label for="file">
               <i className="fa fa-picture-o send-image-btn"></i>
               <input type="file" id="file" style={{display: 'none'}} accept="image/jpg,image/png,image/jpg,image/gif"
               onChange={sendImage}
               ></input>
            </label>
            

            <button
              className="fa fa-smile-o send-emoji-btn"
              aria-hidden="true"
              onClick={() => {setShowEmojiPicker(!showEmojiPicker)}}
            ></button>

            <button
              className="fa fa-paper-plane send-message-btn"
              aria-hidden="true"
              onClick={() => sendMessage('')}
            ></button>
          </div>
        </div>
      )}
    </>
  );
}
export default ChatArea;
