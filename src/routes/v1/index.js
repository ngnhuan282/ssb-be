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
/* Student */
router.use('/students', studentRoute);

/* Parent */
router.use('/parents', parentRoute);

/*User */
router.use('/users', userRoute);

router.use('/routes', routeRoute);

router.use('/schedules', scheduleRoute);

router.use('/location', locationRoute);

/* Bus */
router.use('/buses',busRoute)

/* Driver */
router.use('/drivers', driverRoute)

/* Notification */
router.use('/notifications',notificationRoute)

module.exports = router;