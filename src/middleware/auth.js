const User = require("../models/user");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        const decodedToken = await jwt.verify(token, "Dev@1230");
        const {_id} = decodedToken;
        if(!_id){
            throw new Error("User Not Found")
        }
        const user = await User.findOne({
            _id
        })
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        res.status(401).send("User Not Logged In");
    }
}

module.exports = {
    userAuth
}