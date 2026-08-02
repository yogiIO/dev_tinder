const mongoose = require("mongoose");

function getClusterUserDetails(){
    let pwd, user = "dizizoggy";
    try {
        pwd = encodeURIComponent(process.env.DB_SECRET)
    } catch (error) {
        pwd=process.env.DB_SECRET
    }
    return `${user}:${pwd}`
}

// const URL=`mongodb+srv://dizizoggy:<db_password>@devtinder.kzkrwaq.mongodb.net//` //-->cluster URL

const URL=`mongodb+srv://${getClusterUserDetails()}@devtinder.kzkrwaq.mongodb.net/devTinder` //-->URL to the Database inside cluster



async function connectDB () {
    await mongoose.connect(URL)
}


module.exports = connectDB;
