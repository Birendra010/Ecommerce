
const nodemailer = require("nodemailer");


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
        html:"http://localhost:5000/resetPassword?token="+token+""
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


    module.exports = {sendResetPasswordMail}