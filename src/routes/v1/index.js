const express = require("express");
const router = express.Router();

const studentRoute = require("./studentRoutes");

/* Student */
router.use("/students", studentRoute);

module.exports = {
    router
}