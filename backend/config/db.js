const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Mongo Connection Successful");
    }
    catch (error) {
        console.log("Mongo Connection Failed", error.message)
    }
}

module.exports = connectDB;