require("dotenv").config()
const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const validator = require("validator");
const { validateSignUpdata } = require("./utils/validation");
const { userAuth } = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const requestRouter = require("./routes/request");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");
const cors = require("cors");

const app = express();

const PORT = 3000;

const notAllowedParamsToUpdate = ["emailId", "password"];

app.use(express.json()); // Parsing the incoming request as JS Objects. This is important otherwise req.body will be empty. Here we are explicitly telling server to read the data from the network buffer. Otherwise server will ignore hence req.body?.email will be undefined.
app.use(cookieParser()); //Explicitly tell server to parse cookies, otherwise req.cookie will throw an error
app.use(
  cors({
    origin: "http://localhost:5173", //allow only localhost:5173 to make request
    //origin: function (origin, callback){
    // }
    credentials: true,
  }),
);
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:3001",
//       "https://your-frontend.com",
//     ],
//     credentials: true,
//   }),
// );
// .env
// ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001,https://app.example.com

// const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
//   .split(",")
//   .map((o) => o.trim())
//   .filter(Boolean);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   }),
// );

app.use("/", authRouter);
app.use("/", requestRouter);
app.use("/", profileRouter);
app.use("/", userRouter);

app.patch("/user/:userId", async (req, res) => {
  try {
    const bodyData = req.body;
    const isUpdateNotAllowed = Object.keys(bodyData).some((k) =>
      notAllowedParamsToUpdate.includes(k),
    );
    if (isUpdateNotAllowed) {
      throw new Error(
        `Update not allowed to field ${JSON.stringify(req.body)}`,
      );
    }
    const isMoreThanTenSkills = req.body?.skills.length > 10;
    if (isMoreThanTenSkills) {
      throw new Error(`Cannot Update more than 10 skills`);
    }
    const userId = req.params?.userId;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      returnDocument: "after",
      runValidators: true, // to run the validator for update request as welll, otherwise validator runs only one time that is entry creation time.
    });
    res
      .status(200)
      .send(`Updated user details: ${JSON.stringify(updatedUser)}`);
  } catch (error) {
    res
      .status(400)
      .send(`Error updating user details: ${JSON.stringify(error)}`);
  }
});

app.get("/ping", (req, res) => {
  res.send("Server working");
});

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, (errr) => {
      if (errr) {
        console.log("An error occured:", errr);
      }
      console.log("Server started at:", PORT);
    });
  })
  .catch((err) => console.log("Error connecting Database:", err));
