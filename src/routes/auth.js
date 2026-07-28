const express = require("express");
const { validateSignUpdata } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { USER_SAFE_DATA } = require("../routes/user");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpdata(req.body);
    const hashPassword = await bcrypt.hash(req.body?.password, 10);
    const user = new User({
      emailId: req.body?.emailId,
      password: hashPassword,
      firstName: req.body?.firstName,
      lastName: req.body?.lastName,
    });
    await user.save();
    res.status(200).send("User details Saved");
  } catch (error) {
    res
      .status(400)
      .send(`Error saving the User: ${JSON.stringify(error.message)}`);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Email ID not Valid");
    }
    const getDocumentByEmailId = await User.findOne({
      emailId,
    });
    if (!getDocumentByEmailId) {
      throw new Error("Invalid Credentials");
    }
    const isValidPassword =
      await getDocumentByEmailId.validatePassword(password);
    if (isValidPassword) {
      const token = getDocumentByEmailId.addJWT();
      res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json(getDocumentByEmailId);
    } else {
      throw new Error("Invalid Credentials!");
    }
  } catch (error) {
    res.status(400).send("ERROR" + " " + error.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("logout successfully");
});

module.exports = authRouter;
