import { axiosInstance, url } from "./index";


// Handling the post request for signup
export const signupUser = async(user) => {
     try{
        const response = await axiosInstance.post(url + '/api/auth/signup', user);
        return response.data;
     }catch(error){
        return error;
     }
}
// Handling the post request for login
export const loginUser = async(user) => {
     try{
        const response = await axiosInstance.post(url + '/api/auth/login', user);
        return response.data;
     }catch(error){
        return error;
     }
}