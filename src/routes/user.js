const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photo url skills about gender";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const receivedRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    const data = receivedRequest.map((i) => i.fromUserId);
    res.status(200).json({
      message: "Request Completed",
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error occured",
      error: error.message,
    });
  }
});

userRouter.get("/user/requests/sent", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const sentRequests = await ConnectionRequest.find({
      fromUserId: loggedInUser._id,
      status: "interested",
    }).populate("toUserId", USER_SAFE_DATA);
    const data = sentRequests.map((i) => i.toUserId);
    res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error occured",
      error: error.message,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const data = connectionRequests.map((i) => {
      if (i.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return i.toUserId;
      }
      return i.fromUserId;
    });
    res.status(200).json({
      data,
    });
  } catch (error) {}
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    //TODO:
    // user should not see its own data
    // user should not see accepted connections
    // user should not see rejected connections
    // user should not see ignored users
    // user should not see people who has ignored the user
    // user should not see people who has intereseted the user

    /// In short two conditions, 1 dont show user, user itself.
    // Users with any connection status should not be visible in the feed
    const query = req.query;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id },
        {
          fromUserId: loggedInUser._id,
        },
      ],
    }).select(["toUserId", "fromUserId"]);
    const hideUsersFromFeed = new Set();
    connections.forEach((connection) => {
      hideUsersFromFeed.add(connection.toUserId.toString());
      hideUsersFromFeed.add(connection.fromUserId.toString());
    });
    const feed = await User.find({
      $and: [
        {
          _id: {
            $nin: Array.from(hideUsersFromFeed),
          },
        },
        {
          _id: {
            $ne: loggedInUser._id,
          },
        },
      ],
    })
      .skip(skip)
      .limit(limit)
      .select(USER_SAFE_DATA);
    res.status(200).json({
      message: "done",
      data: feed,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error Occured",
      error: error.message,
    });
  }
});

module.exports = userRouter;
