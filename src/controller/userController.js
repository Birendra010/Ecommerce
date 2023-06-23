const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  try {
    let { email, password } = req.body;

    if ((Object.keys(req.body).length == 0) ||(Object.keys(req.body).length > 2)) {
        return res.status(400).send({ status: false, msg: "invalid request" })}
    

    if (!email) return res.status(400).send({ message: " email is required" });
    if (!password)
      return res.status(400).send({ message: " password is required" });

    // if (!/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(email)) {
    //   return res
    //     .status(400)
    //     .send({ status: false, msg: "Please Enter valid Email" });
    // }


    let existEmail = await userModel.findOne({ email: email });
    if (existEmail) {
      return res.status(400).send({
        status: false,
        msg: "User with this email is already registered",
      });
    }

    let hash = await bcrypt.hash(req.body.password, 10);
    const user = new userModel({
      email: email,
      password: hash,
    });
    let savedData = await userModel.create(user);
    let token = await jwt.sign({ userId: user._id }, "my-self-key", {
        expiresIn: "1m",
      });
    return res.header("x-api-key",token).status(201)
      .send({ status: true, message: "Success", data: savedData });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

///login user

const loginUser = async function (req, res) {
  try {
    const email = req.body.email;
    const Password = req.body.password;

    if (!email) {
      return res.status(400).send({ msg: "email is not present" });
    }
    if (!Password) {
      return res.status(400).send({ msg: "Password is not present" });
    }
    let user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .send({ status: false, msg: "email or Password is not corerct" });
    }
    let hashPassword = await bcrypt.compare(Password, user.password);
    if (!hashPassword) {
      return res.status(404).send({ msg: "email or Password is not corerct" });
    }
    let token = await jwt.sign({ userId: user._id }, "my-self-key", {
      expiresIn: "1m",
    });
    return res.header("x-api-key", token).status(200)
      .send({ status: true, msg: "login successfuly" });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};





module.exports = { signUp, loginUser };











