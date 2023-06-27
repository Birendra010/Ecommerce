const mongoose = require("mongoose");
const cartModel = require("../model/cartModel");
const orderModel = require("../model/orderModel");
// const productModel = require('../model/productModel')
const userModel = require("../model/userModel");

// const { isValidId } = require("../validators/validator");

const createOrder = async (req, res) => {
  try {
    let UserId = req.userId;
    
    let {name,phone,house,city,state,pincode,cartId,productId,status}=req.body;

    // console.log(UserId);
// 
    if (!cartId) {
      return res
        .status(400)
        .send({ staus: false, message: "Please Provide CardId" });
    }
 
    // if (!isValidId(data.cartId)) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "CardID is not valid" });
    // }
    
    

    let cardDetail = await cartModel.findOne({ _id: cartId });
    
    if (!cardDetail) {
      return res
        .status(404)
        .send({ status: false, message: "Card does not exist" });
    }
    if (cardDetail.userId != UserId) {
      return res.status(400).send({ status: false, message: "user not found" });
    }


    let totalQuantity = 0;
    for (let i = 0; i < cardDetail.items.length; i++){
        totalQuantity = totalQuantity+cardDetail.items[i].quantity;
    }
    
    let order  = {
      userId:UserId,
    items:{
      productId:productId,
        quantity:cardDetail.quantity,
    },
    totalQuantity:totalQuantity,
    totalPrice : cardDetail.totalPrice,
    totalItems : cardDetail.totalItems,
    status:status,

        shippingInfo:{
            name:name,
            phone:phone,
            address:{
              house:house,
              city:city,
              state:state,
              pincode:pincode
            }
    }}
    let crearedata = await orderModel.create(order);
    await cartModel.findByIdAndRemove(
      { "_id": cardDetail._id },
      // {$set: { items: [], totalPrice: 0, totalItems: 0 }}
      );
    return res.status(201).send({ status: true, data: crearedata });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { createOrder };
