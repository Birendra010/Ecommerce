const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
// const midd=require('../middleware/auth')



router.post('/user',userController.signUp)
router.post('/login',userController.loginUser)





router.all("/*",(req,res)=>{
    return res.status(404).send({status:false,msg:" invalid request   "})
})


module.exports=router;