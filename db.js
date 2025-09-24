const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://samim:24june2005@cluster0.h3ipc2k.mongodb.net/smart_attend";


async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ MongoDB Atlas Connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}

module.exports = connectDB;
