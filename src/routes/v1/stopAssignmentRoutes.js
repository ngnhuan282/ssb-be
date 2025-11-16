// routes/stopAssignmentRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const stopAssignmentController = require('../../controllers/stopAssignmentController');

// /schedules/:scheduleId/stops/:stopIndex/students
router.get('/', stopAssignmentController.getStopStudents);
router.patch('/:studentId', stopAssignmentController.updateStudentStatus);

module.exports = router;