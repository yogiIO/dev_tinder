
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({ // Schema of the collection
  firstName: {
    type: String,
    minLength: 2,
    maxLength: 50
  },
  lastName: {
    type: String,
    minLength: 2,
    maxLength: 50
  },
  emailId: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true,
    validate (value){
      if(!validator.isEmail(value)){
        throw new Error("Invalid Email")
      }
    }
  },
  password: {
    type: String,
    validate(value){
      if(!validator.isStrongPassword(value)){
        throw new Error("Not a Strong Password");
      }
    },
    // select: false // this doesnt include password in the queries need to explicitly use select() whenever we need to retreive password
  },
  age: {
    type: Number,
    min: 18
  },
  gender: {
    type: String,
    validate (value) {
      if(!['male', 'female', 'others'].includes(value)){
        throw new Error("Gender data is not Valid");
      }
    }
  },
  photoUrl: {
    type: String,
    default: "https://media.licdn.com/dms/image/v2/D5603AQGi44wxN0PdyQ/profile-displayphoto-crop_800_800/B56ZhFP4JqHQAI-/0/1753508447435?e=1781136000&v=beta&t=wt8cTF0YiRlglrbnuHN4r71kvQZLIUUcJeQ30V_2934",
    maxLength: 255,
    validate (value){
      if(!validator.isURL(value)){
        throw new Error("Not a valid URL");
      }
    }
  },
  about: {
    type: String,
    default: "Default About of the User",
    maxLength: 255,
  },
  skills: {
    type: [String],
  },
},
  {timestamps: true},
);


userSchema.methods.addJWT = function (){
  const user = this;
  try {
    const token = jwt.sign({
      _id: this._id
    }, "Dev@1230", {
      expiresIn: "7d"
    })
    return token
  } catch (error) {
    throw error;
  }
}

//Schema Methods

userSchema.methods.validatePassword = async function(userPassword){
  const user = this;
  try {
    const isValidPassword = await bcrypt.compare(userPassword, user.password);
    return isValidPassword
  } catch (error) {
    console.log(error)
  }
}

const User = mongoose.model("User", userSchema); //User - pascal case recommended for creating model // Create Instance of the user Schema/Class
// Model defines document of collection(Table)

module.exports = User;
