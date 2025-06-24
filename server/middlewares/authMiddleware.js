 import jwt from "jsonwebtoken";
 

 export const middlewareAuth = (req, res, next) => {
    try{
      const token = req.headers.authorization.split(' ')[1];

      const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // {userId: user._id}
      
      req.user = {
           userId :  decodedToken.userId
      }; 

      next();
    }catch(error){
        res.status(401).send({
            message: error.message,
            success: false
        })
    }
}