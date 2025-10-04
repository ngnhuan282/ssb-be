const express = require("express");
const router = express.Router();

const studentRoute = require("./studentRoutes");
const parentRoute = require("./parentRoutes");
const userRoute = require("./userRoutes");

/* Student */
router.use('/students', studentRoute);

/* Parent */
router.use('/parents', parentRoute);

/*User */
router.use('/users', userRoute);

module.exports = router;