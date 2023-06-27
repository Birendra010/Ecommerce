const jwt = require("jsonwebtoken");

const authentication = async(req,res,next)=>{
    try {
        let token  = req.headers["x-api-key"];
        if (!token){
            return res.status(401).send({ status: false, msg: "Token is not present please provide token" })
        }
        let decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decodedToken;
        next()

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}

module.exports = {authentication}