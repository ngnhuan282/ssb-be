const express = require('express');
const router = express.Router();
const scheduleController = require('../../controllers/scheduleController');
const scheduleValidation = require("../../validations/scheduleValidation");

router.get('/', scheduleController.getAllSchedules)

router.get('/:id', scheduleController.getScheduleById)

router.post('/', scheduleValidation.validateCreateSchedule, scheduleController.createSchedule)

router.put('/:id', scheduleValidation.validateUpdateSchedule, scheduleController.updateSchedule)

router.delete('/:id', scheduleController.deleteSchedule)

module.exports = router