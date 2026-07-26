const express = require("express");
const User = require("../models/user");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");

// /request/review/:status/:requestId
const requestRouter = express.Router();

requestRouter.get("/feed", async (req, res) => {
  try {
    const allUser = await User.find({});
    res.send(allUser);
  } catch (error) {
    console.log(error);
    res.status(400).send("Error occured");
  }
});

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const connectionDetail = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const allowedStatusList = ["ignored", "interested"];
      if (!allowedStatusList.includes(status)) {
        throw Error("Invalid status");
      }

      const isConnectionRequestAlreadyExist = await ConnectionRequest.findOne({
        $or: [ // logical query
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      const isUserExist = await User.findById(toUserId);
      if(!isUserExist){
        throw Error("User Not Found");
      }
      if(isConnectionRequestAlreadyExist){
        throw Error("Connection Request Already Exist")
      }
      const saveConnectionDetail = await connectionDetail.save();
      res.json({
        message: "Request Sent Successfully",
        status: 200,
        data: saveConnectionDetail,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error Occured",
        error: error.message
      });
    }
  },
);

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const allowedStatus = ["accepted", "rejected"];
    const status = req.params.status;
    const loggedInUser = req.user;
    if(!allowedStatus.includes(status)){
      throw Error("Invalid request")
    }
    const connectionRequest = await ConnectionRequest.findOne({
      _id: req.params.requestId,
      status: "interested",
      toUserId: loggedInUser._id
    })
    if(!connectionRequest){
      return res.status(404).json({
        message: "No result found",
        error: "Error Occured"
      })
    }
    connectionRequest.status = req.params.status;
    const data = await connectionRequest.save()
    return res.status(200).send({
      message: "connection request " + req.params.status,
      data
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error.message,
      error: "Error Occured"
    })
  }
})

module.exports = requestRouter;
