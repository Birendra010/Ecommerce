const jwt = require("jsonwebtoken");

const authentication = async function (req, res, next) {
  try {
    const hedear = req.headers["x-api-key"];
    if (!hedear)
      return res
        .status(400)
        .send({ status: false, msg: "token is not present" });
    jwt.verify(hedear, "my-self-key", function (err, token) {
      if (err) {
        return res
          .status(401)
          .send({
            status: false,
            msg: " Token is invalid Or Token has been Expired",
          });
      } else {
        req.email = token.email;
        next();
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = { authentication };
