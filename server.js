require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const v1Routes = require("./src/routes/v1");
const errorHandlingMiddleware = require("./src/middlewares/errorHandlingMiddleware");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart School Bus API is running");
});

app.use("/api", v1Routes);

app.use(errorHandlingMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is listening on port ${PORT}`);
});
