const mongoose = require("mongoose");
const cartModel = require("../model/cartModel");
const orderModel = require("../model/orderModel");
const productModel = require('../model/productModel')
const userModel = require("../model/userModel");

// const { isValidId } = require("../validators/validator");

const createOrder = async (req, res) => {
  try {
    let userId = req.user.userId
    let {name,phone,house,city,state,pincode,productId}=req.body;

   
   //////input validation
    let cartDetail = await cartModel.findOne({userId}).populate("items.productId" ,("stock"))
        if(!cartDetail){
            return res.status(404).send({status:false,msg:" cart not found"});
        }
        console.log(cartDetail)
        if(cartDetail.items.length <= 0){
            return res.status(400).send({status:false,msg:" add  items in cart to place order"});
        }
        const filter = cartDetail.items.filter(i=>i.quantity > i.productId.stock)
        if(filter.length >0){
            return res.status(400).send({status:false,msg:"some product are out of stock",filter})
        }

   
    let order  = {
      userId,
    items:cartDetail.items,
    totalPrice : cartDetail.totalPrice,
    totalItems : cartDetail.totalItems,
    poducts:cartDetail.items,

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

    cartDetail.items.forEach(async(item) => {
      await productModel.findByIdAndUpdate(
      item.productId._id,
      {$inc: {stock: -item.quantity}},{new:true})
  })
    await cartModel.findByIdAndUpdate(
      cartDetail._id ,
      {$set: { items: [], totalPrice: 0, totalItems: 0 }}
      );
    return res.status(201).send({ status: true,message:"order success", data: crearedata });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};



const getOrder= async function (req, res) {
  try {
    let userId = req.user.userId
  //   console.log(userId)

    //checking if the cart exist with this userId or not
    let findOrder = await orderModel
      .findOne({userId:userId})
      
      .populate("items.quantity","totalPrice ")

    if (!findOrder)
      return res.status(404)
        .send({ status: false, message: `No cart found with given userId` });

    return res.status(200).send({ status: true, message: "Success", data: findOrder });
  } catch (err) {
     return res.status(500).send({ status: false, error: err.message });
  }
};





const updateOrder = async function (req, res) {
  try {
    let userId = req.user.userId
    let data = req.body;
    let { productId} = data;
    let orderDetails = await orderModel.findOne({userId,status:"pending"}).populate("items.productId");
    // let orderDelt = await orderModel.findOne({userId})
    console.log(orderDetails.items[0])
    orderDetails.items.forEach(async(item) => {
        await productModel.findByIdAndUpdate(
        item.productId,
        {$inc: {stock: +item.quantity}},{new:true})
    })
      let orderStatus = await orderModel.findOneAndUpdate(orderDetails._id,

       { $set:{ status:"cancelled"}} ,
        { new: true }
      )
      return res
        .status(200)
        .send({
          status: true,
          message: "Success",
          data: orderStatus,
        });
    }
   catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
}

module.exports = { createOrder ,getOrder,updateOrder};