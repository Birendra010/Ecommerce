const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authSchema } = require("../validators/schemaValidation");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

const sendResetPasswordMail = async(email,token)=>{
try {

  const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
      user:process.env.USER_EMAIL,
      pass:process.env.EMAIL_PASS
    }
  });
  const mailOptions ={
    from:process.env.USER_EMAIL,
    to:email,
    subject:"for reset password",
    Text:"http://localhost:5000/resetPassword?token="+token+""
  }
  transporter.sendMail(mailOptions,function(error,info){
    if(error){
      console.log(error)
    }
    else{
      console.log("mail has been sent:- ",info.response);
    }
  })

} catch (error) {
 return error
}
}

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
      return res
        .status(409)
        .send({ status: false, message: "Email already exist" });

    let hash = await bcrypt.hash(req.body.password, 10);
    const user = new userModel({
      email: email,
      password: hash,
    });
    let savedData = await userModel.create(user);
    let token =  jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    return res
      .cookie("x-api-key", token)
      .status(201)
      .send({ status: true, message: "Success", data: savedData });
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
      return res
        .status(404)
        .send({ status: false, msg: "email or Password are not corerct" });
    }
    let hashPassword = await bcrypt.compare(Password, user.password);
    if (!hashPassword) {
      return res.status(404).send({ msg: "email or Password are not corerct" });
    }
    let token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
      oldTokens = oldTokens.filter(t => {
        const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
        if (timeDiff < 86400) {
          return t;
        }
      });
    }
  
    await userModel.findByIdAndUpdate(user._id, {
      tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
    });
  
    const userInfo = {
      
      email: user.email,
    };
  
    res.json({ success: true, user: userInfo, token });
  




    // return res
    //   .cookie("x-api-key", token)
    //   .status(200)
    //   .send({ status: true, msg: "login successfuly" });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

// send mail to forget  password 
const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const valid = authSchema.validate(email);
    if (valid.error) {
      return res.status(400).send(valid.error.details[0].message);
    }

    const userData = await userModel.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();

      const data = await userModel.findOneAndUpdate(
        { email: email },
        {
          $set: {
            token: randomString,
            tokenExp: Math.round(new Date(Date.now()+ (2*60*1000))),
          },
          new: true,
        }
      );

      sendResetPasswordMail(userData.email, randomString);
      res
        .status(200)
        .send({
          success: true,
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
      return res
        .status(400)
        .send({ success: false, msg: "this token has been expired" });
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
        .status(200)
        .send({
          success: true,
          msg: "User password has been reset",
          data: userData,
        });
    } else {
      res.status(400).send({ success: false, msg: "invalid token " });
    }
  } catch (error) {
    return res.status(400).send({ success: false, msg: error.message });
  }
};







const logout = async (req,res,next) =>{
try {
        // let token  = req.headers["x-api-key"];
  // console.log(token)
  const token =req.headers["x-api-key"]
  console.log(token)
      if (!token) {
        return res
          .status(401)
          .send({ success: false, message: 'Authorization fail!' });
      }
      // 
      let tokens = await userModel.find({})
      // const tokens = req.userId;
      console.log(tokens)
      const newTokens = tokens.filter(t => t.token !== token);
  
      await userModel.findByIdAndUpdate(req.userId._id, { tokens: newTokens });
       return res.status(200).send({ success: true, message: 'Sign out successfully!' });
    
} catch (error) {
  return res.status(400).send({success:false ,msg:error.message})
  
}
}






module.exports = { signUp, loginUser, updatePassword ,forgetPassword,logout};




// exports.signOut = async (req, res) => {
//   if (req.headers && req.headers.authorization) {
//     const token = req.headers.authorization.split(' ')[1];
//     if (!token) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'Authorization fail!' });
//     }

//     const tokens = req.user.tokens;

//     const newTokens = tokens.filter(t => t.token !== token);

//     await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
//     res.json({ success: true, message: 'Sign out successfully!' });
//   }
// };