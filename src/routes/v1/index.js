const express = require("express");
const router = express.Router();

const studentRoute = require("./studentRoutes");
const parentRoute = require("./parentRoutes");

/* Student */
router.use('/students', studentRoute);

/* Parent */
router.use('/parents', parentRoute);

module.exports = router;