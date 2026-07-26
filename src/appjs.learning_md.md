const express = require("express");

const https = require("node:https");

const app = express();

const PORT = 3000;

// Routes are RegExp. ?, +, * --> for example: /tes?t -> s is optional. express V5 willl broke, as this is discontinued

// app.use --> METHOD AGNOSTIC -> Runs for any method.

app.get("/test", (req, res) => {
  //'/test' is a wildcard, anything after /test will match for example /test/1231 -> still works
  res.send("Hellow from test");
});
app.get("/hello", (req, res) => {
  res.send("hellow hello");
});
app.post("/hello", (req, res) => {
  res.send("post hello");
});
app.use("/path/:dynamiRouteParam1/:dynamicRouteParam2", (req, res) => {
  res.send(req.params);
});

app.use(
  "/route",
  (req, res, next) => {
    console.log("handler 1");
    next();
  },
  (req, res, next) => {
    console.log("handler 2");
    next();
    res.send("send Response");
  },
);

app.use(
  "/testPath",
  (req, res, next) => {
    console.log("This is handler one");
    next();
    res.send("Send response 1");
  },
  (req, res) => {
    console.log("handler 2");
    res.send("Send Response 2");
  },
);

app.use(
  "/test-path",
  [
    (req, res, next) => {
      console.log("Array handler");
      next();
    //   res.send("Send Response 1");
    },
    (req, res, next) => {
      console.log("Array handler 2");
    //   res.send("Send Response 2");
    next()
    },
  ],
  (req, res) => {
    console.log("Normal Hanlder Outside array");
    res.send("send response 3");
  },
);




///


app.use('/route-handler', (req, res, next) => {
    console.log('First Router handlder');
    next()
})

app.use('/route-handler', (req, res, next) => {
    console.log('second route handler');
    // next()
    res.send('send response from 2')
})

app.use('/error-handler', (req, res, next) => {
    console.log('error')
    throw new Error('error occured');
    res.send('Send data')
})

app.use('/', (err, req, res, next) => {
    if(err){
        console.log('Handle error')
        res.status(500).send('Server error occured')
    }
})

app.listen(PORT, () => {
  console.log("Application started on PORT:", PORT);
});

//practice
// app.get("/userByEmail", async (req, res) => {
//     try {
//         const userByEmail = await User.findOne({
//             emailId: "abc@gmail.com"
//         })
//         res.status(200).send(userByEmail)
//     } catch (error) {
//         res.status(500).send("Error occured");
//     }
// });

// app.get("/userById", async (req, res) => {
//     try {
//         const userByEmail = await User.findById({
//             _id: "69fceaa5e57464cef9787d5a"
//         })
//         res.status(200).send(userByEmail)
//     } catch (error) {
//         res.status(500).send("Error occured");
//     }
// });


// app.post("/user", async (req, res) => {
//   try {
//     const userDetails = new User(req.body);
//     await userDetails.save();
//     res.send("User Details saved");
//   } catch (error) {
//     res.status(400).send(`Error saving the User: ${JSON.stringify(error)}`);
//   }
// });


app.delete("/deleteUser", async (req, res) => {
  try {
    const body = req.body;
    const deletedUser = await User.deleteOne(body);
    res.status(200).send(`User Deleted: ${JSON.stringify(deletedUser)}`);
  } catch (error) {
    res.status(400).send(`Error occured: ${JSON.stringify(error)}`);
  }
});

app.delete("/deleteUserById", async (req, res) => {
  try {
    const userId = req.body.userId;
    const deletedUser = await User.findByIdAndDelete({ _id: userId });
    res.status(200).send(deletedUser);
  } catch (error) {
    res.status(500).send(`Error Deleting User:${error}`);
  }
});

app.patch("/resetPassword/:userId", async (req, res) => {
  try {
    const isStrongNewPassword = validator.isStrongPassword(
      req.body?.newPassword,
    );
    if (isStrongNewPassword) {
      const updateUserPassword = await User.findByIdAndUpdate(
        req.params?.userId,
        {
          password: req.body.newPassword,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );
      res.status(200).send("New Password updated");
    }
    throw new Error("Password not strong");
  } catch (error) {
    res.status(400).send(`Error Saving New Password: ${JSON.stringify(error)}`);
  }
});
