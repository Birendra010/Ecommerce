const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const productCotroller = require('../controller/productController') 
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const midd=require('../middleware/auth')


//user route
router.post('/signUp',userController.signUp)
router.post('/login',userController.loginUser)
router.post('/forgotPassword',userController.forgetPassword)
router.put('/resetPassword/:emailToken',userController.updatePassword)
router.get('/logout',midd.authentication,userController.logout)
router.post('/refresh-token',userController.refreshToken)


//product route
router.post('/product',productCotroller.createProduct)



//cart route
router.post('/cart',midd.authentication,cartController.createCart)
router.get('/cart',midd.authentication,cartController.getCartDetails)


//order route
router.post('/order',midd.authentication,orderController.createOrder)
router.get('/order',midd.authentication,orderController.getOrder)
router.put('/order',midd.authentication,orderController.cancelOrder)




router.all("/*",(req,res)=>{
    return res.status(404).send({status:false,msg:"   provide a correct end point "})
})


module.exports=router;