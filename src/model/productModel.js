const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    title:{
        type: String,
        required:true,
        trim:true
    },
    description: {
    type: String,
    required: true, 
    trim: true,
  },
  price: {
    type: String,
    required: true
  },
  brand:{
    type:String,
    required: true, 
    trim: true,

  },
  stock: {
    type: Number,
    required: true, 
    default: 1,
  },
  category:{
    type:String,
    required: true, 
    trim: true,
  }
});

module.exports = mongoose.model("Product", productSchema);





