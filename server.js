// server.js
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const v1Routes = require("./src/routes/v1");
const app = express();
const errorHandlingMiddleware = require("./src/middlewares/errorHandlingMiddleware");
const connectDB = require("./src/config/db");

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Smart School Bus API is running');
});

// Gắn route version v1
app.use('/api/v1', v1Routes);

// Thêm middleware xử lý lỗi
app.use(errorHandlingMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server is listening on port ${PORT}`);
});
