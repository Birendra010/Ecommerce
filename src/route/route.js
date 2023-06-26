const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const productCotroller = require('../controller/productController') 
// const midd=require('../middleware/auth')



router.post('/user',userController.signUp)
router.post('/login',userController.loginUser)
router.post('/forgetPassword',userController.forgetPassword)
router.put('/resetPassword',userController.updatePassword)
// router.get('/logout',midd.authentication,userController.logout)



router.post('/product',productCotroller.createProduct)


router.all("/*",(req,res)=>{
    return res.status(404).send({status:false,msg:" invalid request   "})
})


module.exports=router;