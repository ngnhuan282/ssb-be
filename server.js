// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { corsOptions } = require('./src/config/corsOptions');
const v1Routes = require('./src/routes/v1');
const errorHandlingMiddleware = require('./src/middlewares/errorHandlingMiddleware');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');
const { initializeSocket } = require('./src/socket/socketHandler');

const app = express();
const server = http.createServer(app); // Tạo server HTTP
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

connectDB();

app.get('/', (req, res) => {
  res.json({
    message: '🚌 Smart School Bus API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', v1Routes);
app.use(errorHandlingMiddleware);

//goi sockethandler (SOCKET)
initializeSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // Sử dụng server.listen thay vì app.listen
  console.log(`🚀 Server is listening on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});