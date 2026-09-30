import jwt from "jsonwebtoken";

const genToken=async(userId)=>{
 try{
   const token=jwt.sign({id:userId},process.env.JWT_SECRET,{
    expiresIn:"30d"
  });
  return token;
 }catch(error){
  console.error(error);
 }
}

export default genToken;