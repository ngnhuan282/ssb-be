const express = require("express");
const router = express.Router();

const studentRoute = require("./studentRoutes");
const parentRoute = require("./parentRoutes");
const userRoute = require("./userRoutes");
const routeRoute = require("./routeRoutes");
const scheduleRoute = require("./scheduleRoute");
const locationRoute = require('./locationRoute');
const busRoute = require("./busRoutes");
const driverRoute = require("./driverRoutes")
const notificationRoute = require("./notificationRoutes")
const authRoute = require("./authRoute");


router.use('/students', studentRoute);
router.use('/parents', parentRoute);
router.use('/users', userRoute);
router.use('/routes', routeRoute);
router.use('/schedules', scheduleRoute);
router.use('/location', locationRoute);
router.use('/buses',busRoute)
router.use('/drivers', driverRoute)
router.use('/notifications',notificationRoute)

router.use('/auth', authRoute);

module.exports = router;