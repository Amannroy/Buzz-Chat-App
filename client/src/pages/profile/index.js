import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfilePic } from "../../apiCalls/users";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import { setUser } from "../../redux/userSlice";

function Profile() {
  const { user } = useSelector((state) => state.userReducer);
  const [image, setImage] = useState('');
  const dispatch = useDispatch();

  // Whenerver this profile component will be rendered first we are going to check if the user has a profile pic or not. If it has we want to set the image state to the profile pic
  useEffect(() => {
      if(user?.profilePic){
      setImage(user.profilePic);
      }
  }, [user]);

  function getInitials() {
    let f = user?.firstName.toUpperCase()[0];
    let l = user?.lastName.toUpperCase()[0];
    return f + l;
  }

  function getFullName() {
    let fname =
      user?.firstName.at(0).toUpperCase() +
      user?.firstName.slice(1).toLowerCase();
    let lname =
      user?.lastName.at(0).toUpperCase() +
      user?.lastName.slice(1).toLowerCase();
    return fname + " " + lname;
  }
  
  // On that event object we want to read which is the file selected 
  const onFileSelect = async(e) => {
        // We want to get the first selected file  (FileReader is going to read the file and it is going to convert it into base64 string this reader.Result is going to us that base64 string and we want to set that image with that base64 string.So image file will be read in base64 format and it will be saved in the image state.)
        const file = e.target.files[0];

        const reader = new FileReader(file);

        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            setImage(reader.result);
        }
  }

  const updateProfilePic = async() => {
    
    try{
       dispatch(showLoader());
       const response = await uploadProfilePic(image); 
       dispatch(hideLoader());

       if(response.success){
          toast.success(response.message);
          dispatch(setUser(response.data)); // We want to set this user with a new updated user data where we also have the profile pic.
       }else{
          toast.error(response.message);
       }
    }catch(err){
        toast.error(err.message);
       dispatch(hideLoader());
    }
  }
  return (
    <>
      <div className="profile-page-container">
        <div className="profile-pic-container">
          {/* If image is present then display the image otherwise we want to display the intials of the user like avatar will be display*/}
          {image && (
            <img src={image} alt="Profile Pic" className="user-profile-pic-upload" />
          )}
          {!image && (
            <div className="user-default-profile-avatar">{getInitials()}</div>
          )}
        </div>

        <div className="profile-info-container">
          <div className="user-profile-name">
            <h1>{getFullName()}</h1>
          </div>
          <div>
            <b>Email: </b>{user?.email}
          </div>
          <div>
            <b>Account Created: </b>{moment(user?.craetedAt).format('MMM DD, YYYY')}
          </div>
          <div className="select-profile-pic-container">
            <input type="file" onChange={(onFileSelect)}/>
            <button className="upload-image-btn" onClick={updateProfilePic}>Upload</button>
          </div>
        </div>
      </div>
    </>
  );
}
export default Profile;
