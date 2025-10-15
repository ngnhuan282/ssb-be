// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📊 Database name: ${conn.connection.db.databaseName}`); // ✅ Thêm log này
    console.log(`🔗 Connection string: ${process.env.MONGO_URI}`); 
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
