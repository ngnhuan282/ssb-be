const express = require('express');
const router = express.Router();
const scheduleController = require('../../controllers/scheduleController');
const scheduleValidation = require("../../validations/scheduleValidation");
const stopAssignmentRoutes = require('./stopAssignmentRoutes');
router.get('/', scheduleController.getAllSchedules)

router.get('/:id', scheduleController.getScheduleById)

router.get('/driver/:driverId', scheduleController.getSchedulesByDriver);

router.post('/', scheduleValidation.validateCreateSchedule, scheduleController.createSchedule)

router.put('/:id', scheduleValidation.validateUpdateSchedule, scheduleController.updateSchedule)

router.delete('/:id', scheduleController.deleteSchedule);

// router.patch('/:scheduleId/stops/:stopId/students/:studentId', scheduleValidation.validateUpdateStudentStatus, scheduleController.updateStudentStatus);

// router.get('/:scheduleId/stops/:stopIndex/students', scheduleController.getStudentsByStop);

router.use('/:scheduleId/stops/:stopIndex/students', stopAssignmentRoutes);

module.exports = router