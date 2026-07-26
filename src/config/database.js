const mongoose = require("mongoose");

function getClusterUserDetails(){
    let pwd, user = "dizizoggy";
    try {
        pwd = encodeURIComponent("Pwd@1230")
    } catch (error) {
        pwd="Pwd@1230"
    }
    return `${user}:${pwd}`
}


// const URL=`mongodb+srv://dizizoggy:<db_password>@devtinder.kzkrwaq.mongodb.net//` //-->cluster URL

const URL=`mongodb+srv://${getClusterUserDetails()}@devtinder.kzkrwaq.mongodb.net/devTinder` //-->URL to the Database inside cluster



async function connectDB () {
    await mongoose.connect(URL)
}


module.exports = connectDB;
