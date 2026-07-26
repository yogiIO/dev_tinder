const validator = require("validator");

function validateSignUpdata(data) {
  const { firstName, lastName, emailId, password } = data;
  if (!firstName || !lastName) {
    throw new Error("FirstName || lastName is not Valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email ID is not Valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not a Strong Password");
  }
}

module.exports = {
  validateSignUpdata,
};
