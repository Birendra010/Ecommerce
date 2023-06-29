const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authSchema } = require("../validators/schemaValidation");
const randomstring = require("randomstring");
const {sendResetPasswordMail} = require('../validators/sendMail')


//register user
const signUp = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (Object.keys(req.body).length == 0 || Object.keys(req.body).length > 2) {
      return res.status(400).send({ status: false, msg: "invalid request" });
    }
    const valid = authSchema.validate(req.body);

    if (valid.error) {
      return res.status(400).send(valid.error.details[0].message);
    }
    let checkEmail = await userModel.findOne({ email: email });
    if (checkEmail)
      return res.status(409).send({ status: false, message: "Email already exist" });

    let hash = await bcrypt.hash(req.body.password, 10);
    const user = new userModel({
      email: email,
      password: hash,
    });
    let savedData = await userModel.create(user);
    let token =  jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    return res.cookie("x-api-key", token).status(201).send({ status: true, message: "Success", data: savedData });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

///login user

const loginUser = async function (req, res) {
  try {
    const email = req.body.email;
    const Password = req.body.password;

    if (Object.keys(req.body).length == 0 || Object.keys(req.body).length > 2) {
      return res.status(400).send({ status: false, msg: "invalid request" });
    }

    if (!email) {
      return res.status(400).send({ msg: "email is not present" });
    }
    if (!Password) {
      return res.status(400).send({ msg: "Password is not present" });
    }
    let user = await userModel.findOne({ email:email });
    if (!user) {
      return res.status(404).send({ status: false, msg: "email or Password are not corerct" });
    }
    let hashPassword = await bcrypt.compare(Password, user.password);
    if (!hashPassword) {
      return res.status(404).send({ msg: "email or Password are not corerct" });
    }
    let token =  jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    let refreshToken = jwt.sign({userId:user._id},process.env.REF_TOKEN_SECRET,{expiresIn:process.env.REF_TOKEN_EXPIRE})
    const response = {
      "status": "Logged in",
      "token": token,
      "refreshToken": refreshToken,
    }
    let oldTokens = user.tokens || [];
    if (oldTokens.length) {
      oldTokens = oldTokens.filter(t => {
        if (t.signedAt < Date.now()){
          return t;
        }
      });
    }
    await userModel.findByIdAndUpdate(user._id, {
      tokens: [...oldTokens, { token, signedAt: new Date(Date.now()+ (5*60*1000))}],
    });
    const userInfo = {
      email: user.email,
    };
    res.status(200).send({ success: true, user: userInfo, response });
  
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};



//refreshToken
const refreshToken=  (req,res) => {
  try {
  
  const postData = req.body
  if(postData.refreshToken){
    let decodedToken = jwt.verify(postData.refreshToken,process.env.REF_TOKEN_SECRET);
      const token = jwt.sign({userId:decodedToken.userId},process.env.JWT_SECRET, { expiresIn:'5m'})
      const response = {
          "token": token,
      }
      res.status(200).json(response);        
  } else {
      res.status(404).send('Invalid request')
  }

} catch (error) {
  return res.status(500).send({msg:error.message})
    
}}


// send mail to forget  password 
const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await userModel.findOne({email})
    if(!userData){
      return res.status(404).send({success:false,msg:" email not found"})
    }
    if (userData) {
      const randomString = randomstring.generate();

      const data = await userModel.findOneAndUpdate(
        { email: email },
        {
          $set: {
            token: randomString,
            tokenExp: Math.round(new Date(Date.now()+ (2*60*1000))),},new: true,});
      sendResetPasswordMail(userData.email, randomString);
      res.status(200).send({success: true,
          msg: "please check your inbox of mail and reset your password ",
        });
    } else {
      res.status(400).send({ success: false, msg: "this mail does not exits" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};


//update new password 
const updatePassword = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await userModel.findOne({ token: token });

    if(!tokenData){
      return res.status(400).send({success:false,msg:"token expired or empty"})
    }
    if (tokenData.tokenExp < Date.now()) {
      return res.status(400).send({ success: false, msg: "this token has been expired" });
    }
    if (tokenData) {
      const password = req.body.password;
      const newPassword = await bcrypt.hash(password,10)
      const userData = await userModel.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      return res
        .status(200).send({success: true,msg: "User password has been reset",data: userData,});
    } else {
      res.status(400).send({ success: false, msg: "invalid token " });
    }
  } catch (error) {
    return res.status(400).send({ success: false, msg: error.message });
  }
};






///logout
const logout = async (req,res) =>{
  let userId =req.user.userId
try {
    let token  = req.headers["x-api-key"];
    const tokens = req.user.tokens 
     
      let user = await userModel.findById(userId)
  const newTokens = user.tokens.filter(t => t.token !== token)
      
await userModel.findByIdAndUpdate(userId ,{tokens:newTokens},{new:true});
      
  return res.status(200).send({ success: true, message: 'Sign out successfully!'});
    
} catch (error) {
  return res.status(500).send({success:false ,msg:error.message})
  
}
}





module.exports = { signUp, loginUser, updatePassword ,forgetPassword,logout,refreshToken};