
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const {isValidBody,isValidId} = require("../validators/validator")



  const createCart = async function (req, res) {
    try {
      let userId = req.user.userId
      let data = req.body;
      if (isValidBody(data)) {
        return res.status(400).send({ status: false, message: "please provide request body" });
      }
  
      let { productId } = data;
      if (!isValidId(productId)) {
        return res.status(400).send({ status: false, message: "please provide valid product Id" });
      }
     
  
      let product = await productModel.findById(productId);
      if (!product) {
        return res.status(400).send({status: false,message: "this product is not found in product model"});
      }
  
        let userCart = await cartModel.findOne({ userId:userId });
        let cart={};
        if (!userCart) {
          cart.userId= userId
          cart.items =[{productId,quantity:1}]
          cart.totalItems = 1;
          cart.totalPrice = product.price
          const newCart = await cartModel.create(cart)
          return res.status(201).send({ status: false,message:"cart created",newCart });
        }
        let quantity = 1;
        let arr = userCart.items;
     
        let isExist = false;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].productId == productId) {
            isExist = true;
            arr[i].quantity += quantity;
          }
        }
        if (!isExist) {
          arr.push({ productId: productId, quantity: quantity });
        }
        cart.items= arr;
        let price = product.price;
        cart.totalPrice = userCart.totalPrice + (price * quantity)
        cart.totalItems = arr.length;
        let update = await cartModel.findByIdAndUpdate(userCart._id,cart,{new:true}) 
        return res.status(201).send({status: true,message: "cart created successfully",data: update});
   
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }

  const getCartDetails = async function (req, res) {
    try {
      let userId = req.user.userId
  
      //checking if the cart exist with this userId or not
      let findCart = await cartModel
        .findOne({userId:userId})
        
        .populate("items.productId","price brand stock category")

      if (!findCart)
        return res.status(404).send({ status: false, message: `No cart found with given userId` });
  
      return res.status(200).send({ status: true, message: "Success", data: findCart });
    } catch (err) {
       return res.status(500).send({ status: false, error: err.message });
    }
  };




  
  module.exports={createCart,getCartDetails,}