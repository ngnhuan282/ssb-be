const StopAssignment = require('../models/StopAssisgnmentModel');
const ApiError = require('../utils/apiError');
const HttpStatus = require('http-status');

const getAssignmentsByStop = async (scheduleId, stopIndex) => {
  return await StopAssignment.find({ schedule: scheduleId, stopIndex })
    .populate('student', 'name class phone')
    .lean();
};

const updateAssignment = async (scheduleId, stopIndex, studentId, data) => {
  const filter = { schedule: scheduleId, stopIndex, student: studentId };
  const update = { 
    ...data,
    boardedAt: data.status === 'boarded' ? new Date() : undefined
  };

  const assignment = await StopAssignment.findOneAndUpdate(
    filter,
    update,
    { new: true, upsert: true }
  ).populate('student');

  if (!assignment) throw new ApiError(HttpStatus.NOT_FOUND, 'Assignment not found');
  return assignment;
};

module.exports = { getAssignmentsByStop, updateAssignment };