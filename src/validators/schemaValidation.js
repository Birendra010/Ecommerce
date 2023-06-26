const Joi = require('joi')

const authSchema = Joi.object({
email:Joi.string().email().lowercase().required().regex(/^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/),
password:Joi.string().min(2).required(),

})
const productSchema = Joi.object({
    title:Joi.string().required(),
    description:Joi.string().required(),
    brand:Joi.string().required(),
    category:Joi.string().required(),
    price:Joi.string().required(),
    stock:Joi.number().required(),

    
    })
    const orderSchema = Joi.object({
     
      quantity:Joi.number().required().min(1),
      totalPrice:Joi.number().required(),
      totalItems:Joi.number().required(),
      totalQuatity:Joi.number().required(),
      
    })

module.exports = {authSchema,productSchema,orderSchema}