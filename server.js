// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { corsOptions } = require('./src/config/corsOptions');
const v1Routes = require('./src/routes/v1');
const errorHandlingMiddleware = require('./src/middlewares/errorHandlingMiddleware');
const connectDB = require('./src/config/db');

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (req, res) => {
  res.json({ 
    message: '🚌 Smart School Bus API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res, next) => {
  console.log('🧠 Incoming request:', req.method, req.url);
  console.log('👉 Origin:', req.headers.origin);
  console.log('👉 Cookies:', req.headers.cookie || 'No cookie received');
  next();
});


app.use('/api/v1', v1Routes);
app.use(errorHandlingMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('ACCESS_TOKEN_SECRET_SIGNATURE:', process.env.ACCESS_TOKEN_SECRET_SIGNATURE); // Kiểm tra .env
});