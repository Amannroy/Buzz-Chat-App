import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../../../apiCalls/chat";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice";
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";

function UsersList({ searchKey, socket, onlineUser }) {
  const { allUsers, allChats, user: currentUser, selectedChat } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  const startNewChat = async (searchedUserId) => {
    let response = null;
    try {
      dispatch(showLoader());
      response = await createNewChat([currentUser._id, searchedUserId]);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChat = [...allChats, newChat];
        dispatch(setAllChats(updatedChat));
        dispatch(setSelectedChat(newChat));
      }
    } catch (error) {
      toast.error(response?.message || "Something went wrong");
      dispatch(hideLoader());
    }
  };

  // This function opens an existing chat between the current user and the selected user.
  const openChat = (selectedUserId) => {
    const chat = allChats.find(chat =>
      chat.members.map(m => m._id).includes(currentUser._id) &&
      chat.members.map(m => m._id).includes(selectedUserId)
    );
    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  // Checks if the given user is part of the currently selected chat.
  const isSelectedChat = (user) => {
    if (selectedChat) {
      return selectedChat.members.map(m => m._id).includes(user._id);
    }
    return false;
  };

  // Gets the time when the last message was sent in the chat with this user.
  const getLastMessageTimeStamp = (userId) => {
    const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));

    if (!chat || !chat?.lastMessage) {
      return "";
    } else {
      return moment(chat?.lastMessage?.createdAt).format('hh:mm A');
    }
  };

  // Gets a short preview of the last message in the chat with this user.
  const getLastMessage = (userId) => {
    const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));

    if (!chat || !chat.lastMessage) {
      return "";
    } else {
      const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
      return msgPrefix + chat?.lastMessage?.text?.substring(0, 25);
    }
  };

  // Formats the user's name with proper capitalization.
  const formatName = (user) => {
    let fname = user.firstName.at(0).toUpperCase() + user.firstName.slice(1).toLowerCase();
    let lname = user.lastName.at(0).toUpperCase() + user.lastName.slice(1).toLowerCase();
    return fname + ' ' + lname;
  };

  useEffect(() => {
    socket.off('set-message-count').on('set-message-count', (message) => {
          let selectedChat = store.getState().userReducer.selectedChat;
          let allChats = store.getState().userReducer.allChats;

          // Display the unread message count only if the chat for which we have received the messages is not the selected chat
          if(selectedChat?._id !== message.chatId){
              const updatedChats = allChats.map(chat => {
                if(chat._id === message.chatId){
                  return {
                    ...chat, 
                    unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
                    lastMessage: message
                  }
                }
                return chat;
              })
              allChats = updatedChats;
          }
          // 1.FIND THE LATEST CHAT
          const latestChat = allChats.find(chat => chat._id === message.chatId);

          // 2. GET ALL OTHER CHATS EXCEPT THE LATEST CHAT
          const otherChats = allChats.filter(chat => chat._id !== message.chatId);

          // 3. CREATE A NEW ARRAY WITH LATEST CHAT AS THE FIRST ELEMENT AND WE WANT OTHER CHAT OBJECTS
          allChats = [latestChat, ...otherChats];

          dispatch(setAllChats(allChats));
    })
  }, [])

  // Returns the unread message count for the chat with this user.
  const getUnreadMessaageCount = (userId) => {
    const chat = allChats.find(chat => chat.members.map(m => m._id).includes(userId));

    if (chat && chat.unreadMessageCount && chat.lastMessage?.sender !== currentUser._id) {
      return <div className="unread-message-counter"> {chat.unreadMessageCount} </div>;
    } else {
      return "";
    }
  };

  // Filters the users based on the searchKey or returns all chats.
  function getData() {
    if (searchKey === "") {
      return allChats;
    } else {
      return allUsers.filter(user => {
        user.firstName?.toLowerCase().includes(searchKey?.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchKey?.toLowerCase())
      }
      );
    }
  };

  return (
        getData()
        .map(obj => {
            let user = obj;
            if(obj.members){
                user = obj.members.find(mem => mem._id !== currentUser._id);
            }
            
            return <div className="user-search-filter" onClick={() => openChat(user._id)} key={user._id}>
                <div className={isSelectedChat(user) ? "selected-user": "filtered-user"}>
                    <div className="filter-user-display">
                        {user.profilePic && <img src={user.profilePic} 
                                                alt="Profile Pic" 
                                                className="user-profile-image" 
                                                style={onlineUser.includes(user._id) ? {border: '#82e0aa 3px solid'} : {}} 
                                            />}

                        {!user.profilePic &&<div 
                                                className={isSelectedChat(user)? "user-selected-avatar" : "user-default-avatar"}
                                                style={onlineUser.includes(user._id) ? {border: '#82e0aa 3px solid'} : {}}
                                            >
                            {
                                user.firstName.charAt(0).toUpperCase() + 
                                user.lastName.charAt(0).toUpperCase()
                            }
                        </div>}
                        <div className="filter-user-details">
                            <div className="user-display-name">{ formatName(user)}</div>
                            <div className="user-display-email">{ getLastMessage(user._id) || user.email }</div>
                        </div>
                        <div>
                            { getUnreadMessaageCount(user._id) }
                            <div className="last-message-timestamp">{ getLastMessageTimeStamp(user._id)}</div>
                        </div>
                        { !allChats.find(chat => chat.members.map(m => m._id).includes(user._id)) &&
                            <div className="user-start-chat">
                                <button className="user-start-chat-btn" onClick={() => startNewChat(user._id)}>
                                    Start Chat
                                </button>
                            </div>
                        }
                        </div>
                    </div>                        
            </div>
        })
    )
}

export default UsersList;
