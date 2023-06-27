const mongoose = require("mongoose");
const cartModel = require("../model/cartModel");
const userModel = require("../model/userModel");
const productModel = require("../model/productModel");



const {isValidBody,isValidId,isValid} =require('../validators/validator')




const createCart = async function (req, res) {
    try {
      let UserId = req.userId
      let user = await userModel.findOne({ _id: UserId });
      if (!user) {
        return res.status(400).send({
          status: false,
          message: "this user is not found in user model",
        });
      }
  
      let data = req.body;
  
      if (isValidBody(data)) {
        return res
          .status(400)
          .send({ status: false, message: "please provide request body" });
      }
  
      let { productId, cartId } = data;
  
      if (!isValidId(productId)) {
        return res
          .status(400)
          .send({ status: false, message: "please provide valid product Id" });
      }
  
      if (!isValid(cartId) || cartId == "") {
        return res
          .status(400)
          .send({ status: false, message: "cart id cannot be empty" });
      }
  
      let product = await productModel.findOne({ _id: productId });
      if (!product) {
        return res.status(400).send({
          status: false,
          message: "this product is not found in product model",
        });
      }
  
      if (!cartId) {
        let checking = await cartModel.findOne({ userId: UserId });
        if (checking) {
          return res.status(409).send({
            status: false,
            message:
              "this user already have a cart please give cart id in request body",
          });
        }
      }
  
      if (cartId) {
        if (!isValidId(cartId)) {
          return res
            .status(400)
            .send({ status: false, message: "please provide valid Cart Id" });
        }
  
        let cart = await cartModel.findOne({ _id: cartId });
        if (!cart) {
          return res
            .status(400)
            .send({ status: true, message: "This cart id is not available" });
        }
        let quantity = 1;
        let arr = cart.items;
  
        let isExist = false;
        for (let i = 0; i < cart.items.length; i++) {
          if (cart.items[i].productId == productId) {
            isExist = true;
            cart.items[i].quantity += quantity;
          }
        }
        if (!isExist) {
          arr.push({ productId: productId, quantity: quantity });
        }
  
        let price = product.price;
        cart.totalPrice += price * quantity;
        cart.totalItems = arr.length;
  
        let update = await cartModel.findOneAndUpdate({ _id: cartId }, cart, {
          new: true,
        });
  
        return res.status(201).send({
          status: true,
          message: "cart created successfully",
          data: update,
        });
      }
      if (!cartId) {
        let obj = {};
        obj.userId = UserId;
        obj.items = [{ productId: productId, quantity: 1 }];
        obj.totalPrice = product.price;
        obj.totalItems = obj.items.length;
  
        let dataStored = await cartModel.create(obj);
  
        return res.status(201).send({
          status: true,
          message: "cart created successfully",
          data: dataStored,
        });
      }
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message });
    }
  };
  

  const getCartDetails = async function (req, res) {
    try {
      let userId = req.userId;
  
      //checking if the cart exist with this userId or not
      let findCart = await cartModel
        .findOne({ userId: userId })
        
        .populate("items.productId","price brand stock category")
      if (!findCart)
        return res
          .status(404)
          .send({ status: false, message: `No cart found with given userId` });
  
      res.status(200).send({ status: true, message: "Success", data: findCart });
    } catch (err) {
      res.status(500).send({ status: false, error: err.message });
    }
  };









  
  module.exports={createCart,getCartDetails,}