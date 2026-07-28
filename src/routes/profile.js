const express = require("express");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const { password, __v, ...userDetails } = user._doc;
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(400).send(JSON.stringify(error));
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  //TODO: Sanitize data
  try {
    const loggedInUser = req.user;
    const updates = req.body?.updates;
    if (!loggedInUser || !updates || updates?.password) {
      throw new Error("Invalid Params");
    }
    const getUpdatedUserDetails = await User.updateOne(
      { _id: loggedInUser._id },
      { ...updates },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ); //use save() since req.user is already an entry from the DB.
    Object.keys(req.body.updates).forEach((key) => (loggedInUser[key] = req.body.updates[key]));
    if (!getUpdatedUserDetails) {
      throw new Error("Cannot updates password");
    }
    res.status(200).json(loggedInUser);
  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid Request" + " " + error.message);
  }
});

module.exports = profileRouter;
