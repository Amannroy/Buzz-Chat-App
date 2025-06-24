import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getLoggedUser } from "../apiCalls/users";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import toast from "react-hot-toast";
import { setAllChats, setAllUsers, setUser } from "../redux/userSlice";
import { getAllChats } from "../apiCalls/chat";

function ProtectedRoute({ children }) {
  const {user} = useSelector(state => state.userReducer);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  // getLoggedInUser function is going to fetch the user details and it is going to assign this user state with the user details with that user object which we are receiving in the response
  const getLoggedInUser = async () => {
    let response = null;
    try {
      dispatch(showLoader());
      response = await getLoggedUser();
      dispatch(hideLoader());

      if (response.success) {
        dispatch(setUser(response.data));
      } else {
        toast.error(response.message);
        window.location.href = '/login'
      }
    } catch (error) {
      dispatch(hideLoader());
      navigate("/login");
    }
  };

 

  const getAllUsersFromDb = async() => {
        let response = null;
       try{
         dispatch(showLoader());
         response = await getAllUsers();
         dispatch(hideLoader());

      if (response.success) {
        dispatch(setAllUsers(response.data));
      } else {
        toast.error(response.message);
        window.location.href = '/login'
      }
       }catch(error){
         dispatch(hideLoader());
         navigate("/login");
       }
  }

  // Get all the chats of the current logged in user
  const getCurrentUserChats = async() => {
       try{
        const response = await getAllChats();
        if(response.success){
          dispatch(setAllChats(response.data));
        }
       }catch(error){
        navigate('/login');
       }
  }

   useEffect(() => {
    if (localStorage.getItem("token")) {
      // Write logic to get details of current logged in user
      getLoggedInUser();
      getAllUsersFromDb();
      getCurrentUserChats();
    } else {
      navigate("/login");
    }
  }, []);

  return (
  <div>
   {children}
   </div>
   );
}

export default ProtectedRoute;
