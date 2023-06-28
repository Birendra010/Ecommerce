const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;



const jwt = require("jsonwebtoken");

const jwtToken = (id)=>{
    return jwt.sign({_id:id},process.env.JWT_SECRET,{expiresIn:"5m"}) 
}
const verifyToken = (token)=>{
  return  jwt.verify(token,process.env.JWT_SECRET);

}

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value)
}

const isValidBody = (reqBody) => {
    return Object.keys(reqBody).length == 0;
  };

  const isValidId = function (id) {
    return mongoose.Types.ObjectId.isValid(id);
  };
  const isValid = (value) => {
    if (typeof value === "undefined" || typeof value === "null") return true;
    if (typeof value === "string" && value.trim().length != 0) return true;
    if (typeof value === "object" && Object.keys(value).length == 0) return true;
  
    return false;
  };
  

  module.exports ={isValidBody,jwtToken,isValidId,isValid,isValidObjectId,verifyToken}