const stopAssignmentService = require('../services/stopAssignmentService');

const getStopStudents = async (req, res, next) => {
  try {
    const { scheduleId, stopIndex } = req.params;
    const students = await stopAssignmentService.getAssignmentsByStop(scheduleId, stopIndex);
    res.json(students);
  } catch (err) {
    next(err);
  }
};

const updateStudentStatus = async (req, res, next) => {
  try {
    const { scheduleId, stopIndex, studentId } = req.params;
    const data = req.body;
    const updated = await stopAssignmentService.updateAssignment(scheduleId, stopIndex, studentId, data);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStopStudents, updateStudentStatus };