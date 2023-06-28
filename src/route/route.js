const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const productCotroller = require('../controller/productController') 
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const midd=require('../middleware/auth')


//user Api
router.post('/user',userController.signUp)
router.post('/login',userController.loginUser)
router.post('/forgetPassword',userController.forgetPassword)
router.put('/resetPassword',userController.updatePassword)
router.get('/logout',midd.authentication,userController.logout)
router.post('/refreshToken',userController.refreshToken)


//product Api
router.post('/product/',productCotroller.createProduct)



//cart api
router.post('/cart',midd.authentication,cartController.createCart)
router.get('/cart',midd.authentication,cartController.getCartDetails)


//order
router.post('/order',midd.authentication,orderController.createOrder)
router.get('/order',midd.authentication,orderController.getOrder)
router.put('/order',midd.authentication,orderController.updateOrder)




router.all("/*",(req,res)=>{
    return res.status(404).send({status:false,msg:" invalid request   "})
})


module.exports=router;