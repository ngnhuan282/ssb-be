// server.js
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { corsOptions } = require('./src/config/corsOptions'); 
const v1Routes = require("./src/routes/v1");
const errorHandlingMiddleware = require("./src/middlewares/errorHandlingMiddleware");
const connectDB = require("./src/config/db");

const app = express();

// 1. CORS - Phải đầu tiên
app.use(cors(corsOptions)); 

// 2. Cookie Parser - Cần thiết để đọc cookies
app.use(cookieParser()); 

// 3. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚌 Smart School Bus API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Gắn route version v1
app.use('/api/v1', v1Routes);

// Error handling middleware 
app.use(errorHandlingMiddleware);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});