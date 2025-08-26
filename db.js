
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1); // Optional: Exit process if DB fails
  }
};

module.exports = connectDB; 