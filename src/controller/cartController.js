
const mongoose = require("mongoose")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const {isValidBody,isValidId,isValid} = require("../validators/validator")

const { isValidObjectId } = require("../validators/validator")



// const createCart = async function (req, res) {
//     try {
//         const UserId = req.user.userId
//         // console.log(UserId)
//         const { cartId, productId } = req.body

//         if (!productId || !isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }
//         const checkProduct = await productModel.findById(productId)
//         if (!checkProduct) {
//             return res.status(404).send({ status: false, message: "Product not found " })
//         }
//         let itemForAdd = {
//             "productId": productId,
//             "quantity": 1
//         }

//         if (cartId) {
//             if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: "Please provide a valid cartId." }) }
//             const checkCart = await cartModel.findById(cartId)
//             if (!checkCart) {
//                 return res.status(404).send({ status: false, message: "cart not found " })
//             }
//             let arr = checkCart.items
//             for (let i = 0; i < arr.length; i++) {
//                 if (arr[i].productId == itemForAdd.productId) {
//                     arr[i].quantity = arr[i].quantity + itemForAdd.quantity;
//                     break
//                 }
//                 else if (i == (arr.length - 1)) {
//                     arr.push(itemForAdd)
//                     break
//                 }
//             }
//             if (checkCart.items.length == 0) {
//                 arr.push(itemForAdd)
//             }
//             const dataForUpdate = {
//                 "userId": UserId,
//                 "items": arr,
//                 "totalPrice": checkProduct.price + checkCart.totalPrice,
//                 "totalItems": arr.length
//             }
//             const updateCard = await cartModel.findByIdAndUpdate(
//                 { "_id": cartId },
//                 { $set: dataForUpdate },
//                 { new: true }
//             ).populate("items.productId", ("price brand stock category title "))
//             return res.status(201).send({ status: true, message: "Success", data: updateCard })

//         }
//         else {
//             const checkCart = await cartModel.findById(UserId)
//             if (checkCart) {
//                 return res.status(400).send({ status: false, message: "A cart with this UserId already present try to edit that cart" })
//             }

//             const dataForCreate = {
//                 "userId": UserId,
//                 "items": [itemForAdd],
//                 "totalPrice": checkProduct.price,
//                 "totalItems": 1
//             }
//             const createCart1 = await cartModel.create(dataForCreate)



//             return res.status(201).send({ status: true, message: "Success", data: createCart1 })

//         }
//     } catch (err) {
//         return res.status(500).send({ status: false, message: err.message });
//     }
// }


// const createCart = async function (req, res) {
//     try {
//       let UserId = req.user.userId;
  
      
//    
  
//       let data = req.body;
  
//       if (isValidBody(data)) {
//         return res
//           .status(400)
//           .send({ status: false, message: "please provide request body" });
//       }
  
//       let { productId} = data;
  
//       if (!isValidId(productId)) {
//         return res
//           .status(400)
//           .send({ status: false, message: "please provide valid product Id" });
//       }
  
//       if (!isValid(cartId) ) {
//         return res
//           .status(400)
//           .send({ status: false, message: "cart id cannot be empty" });
//       }
  
//       let product = await productModel.findOne({ _id: productId });
//       if (!product) {
//         return res.status(400).send({
//           status: false,
//           message: "product is not found ",
//         });
//       }
  
//     ********
//       
//         let checking = await cartModel.findOne({ userId: UserId });
//         if (checking) {
//           return res.status(409).send({
//             status: false,
//             message:
//               "this user already have a cart please give cart id in request body",
//           });
//         }
//       }
  
//      
  
//         let cart = await cartModel.findOne({ _id: cartId });
//         if (!cart) {
//           return res
//             .status(400)
//             .send({ status: true, message: "This cart id is not available" });
//         }
//         let quantity = 1;
//         let arr = cart.items;
  
//         let isExist = false;
//         for (let i = 0; i < cart.items.length; i++) {
//           if (cart.items[i].productId == productId) {
//             isExist = true;
//             cart.items[i].quantity += quantity;
//           }
//         }
//         if (!isExist) {
//           arr.push({ productId: productId, quantity: quantity });
//         }
  
//         let price = product.price;
//         cart.totalPrice += price * quantity;
//         cart.totalItems = arr.length;
  
//         let update = await cartModel.findOneAndUpdate({ _id: cartId }, cart, {
//           new: true,
//         });
  
//         return res.status(201).send({
//           status: true,
//           message: "cart created successfully",
//           data: update,
//         });
//       }
//       if (!cartId) {
//         let obj = {};
//         obj.userId = UserId;
//         obj.items = [{ productId: productId, quantity: 1 }];
//         obj.totalPrice = product.price;
//         obj.totalItems = obj.items.length;
  
//         let dataStored = await cartModel.create(obj);
  
//         return res.status(201).send({
//           status: true,
//           message: "cart created successfully",
//           data: dataStored,
//         });
//       }
//     } catch (err) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   };



  
  

  const getCartDetails = async function (req, res) {
    try {
      let userId = req.user.userId
    //   console.log(userId)
  
      //checking if the cart exist with this userId or not
      let findCart = await cartModel
        .findOne({userId:userId})
        
        .populate("items.productId","price brand stock category")

      if (!findCart)
        return res.status(404)
          .send({ status: false, message: `No cart found with given userId` });
  
      return res.status(200).send({ status: true, message: "Success", data: findCart });
    } catch (err) {
       return res.status(500).send({ status: false, error: err.message });
    }
  };










  const createCart = async function (req, res) {
    try {
      let UserId = req.user.userId
     
  
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


















  
  module.exports={createCart,getCartDetails,}