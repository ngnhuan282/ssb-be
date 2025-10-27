// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const v1Routes = require("./src/routes/v1");
const app = express();
const errorHandlingMiddleware = require("./src/middlewares/errorHandlingMiddleware");
const connectDB = require("./src/config/db");
const { corsOptions } = require("./src/config/corsOptions");
const cookieParser = require("cookie-parser");
const http = require('http');
const { Server } = require('socket.io');

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

connectDB();

app.get("/", (req, res) => {
  res.send("Smart School Bus API is running");
});

// Gắn route version v1
app.use("/api/v1", v1Routes);

// Thêm middleware xử lý lỗi
app.use(errorHandlingMiddleware);

// Socket.io handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinBusRoom", (busId) => {
    socket.join(busId);
    console.log(`User ${socket.id} joined bus room ${busId}`);
  });

  socket.on("updateLocation", (data) => {
    io.to(data.busId).emit("locationUpdated", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server is listening on port ${PORT}`);
});
