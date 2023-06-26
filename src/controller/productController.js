const productModel = require("../model/productModel");
const { productSchema } = require("../validators/schemaValidation");

const createProduct = async function (req, res) {
  try {
    let { name, price, Stock } = req.body;

    if (Object.keys(req.body).length == 0 || Object.keys(req.body).length > 3) {
      return res.status(400).send({ status: false, msg: "invalid request" });
    }
    const valid = productSchema.validate(req.body);

    if (valid.error) {
      return res.status(400).send(valid.error.details[0].message);
    }

    let checkName = await productModel.findOne({ name: name });
    if (checkName)
      return res
        .status(409)
        .send({ status: false, message: "product  already exist" });

    let product = await productModel.create(req.body);
    return res.status(201).send({
      status: true,
      message: "Success",
      data: product,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createProduct };
