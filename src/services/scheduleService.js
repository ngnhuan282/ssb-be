const ApiError = require("../utils/apiError");
const Schedule = require("../models/ScheduleModel");
const HttpStatus = require('http-status');

const getAllSchedules = async () => {
  return await Schedule.find()
    .populate('bus')
    .populate('route')
    .populate({
      path: 'driver',
      populate: { path: 'user', select: 'username email role' }
    })
    .lean();
};

const getScheduleById = async (id) => {
  const schedule = await Schedule.findById(id).populate('bus route driver');
  if (!schedule) throw new ApiError(HttpStatus.NOT_FOUND, 'Schedule not found');
  return schedule;
}

const getSchedulesByDriver = async (driverId) => {
  return await Schedule.find({ driver: driverId })
    .populate({
      path: 'driver',
      populate: { path: 'user', select: 'username email phone' }
    })
    .populate({
      path: 'route',
      select: 'name distance estimatedTime stops',   // <-- thêm stops
      // Không cần populate vì stops là sub‑document
    })
    .populate('bus', 'licensePlate')
    .sort({ date: 1 })
    .exec();
};

const createSchedule = async (scheduleData) => {
  const schedule = new Schedule(scheduleData);
  return (await schedule.save()).populate(['bus', 'route', 'driver', 'students']);
}

const updateSchedule = async (id, updateData) => {
  const schedule = await Schedule.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedAt: Date.now()
    },
    {
      new: true,
      runValidators: true
    }
  );
  if (!schedule) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Schedule not found')
  }
  return schedule.populate(['bus', 'route', 'driver', 'students']);
}

const deleteSchedule = async (id) => {
  const schedule = await Schedule.findByIdAndDelete(id);
  if (!schedule) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Schedule not found');
  }
  return schedule;
}

const updateStopStatus = async (scheduleId, stopId, updateData) => {
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) throw new ApiError(HttpStatus.NOT_FOUND, 'Schedule not found');

  const stop = schedule.route.stops.id(stopId);
  if (!stop) throw new ApiError(HttpStatus.NOT_FOUND, 'Stop not found');

  Object.assign(stop, updateData);
  await schedule.save();

  return stop;
};

// const updateStudentStatus = async (scheduleId, stopId, studentId, updateData) => {
//   const schedule = await Schedule.findById(scheduleId);
//   if (!schedule) throw new ApiError(HttpStatus.NOT_FOUND, 'Schedule not found');

//   const stop = schedule.route.stops.id(stopId);
//   if (!stop) throw new ApiError(HttpStatus.NOT_FOUND, 'Stop not found');

//   const student = stop.students?.id(studentId);
//   if (!student) throw new ApiError(HttpStatus.NOT_FOUND, 'Student not found in this stop');

//   Object.assign(student, updateData);
//   if (updateData.status === 'boarded' && !updateData.boardedAt) {
//     student.boardedAt = new Date();
//   }

//   await schedule.save();
//   return stop;
// };

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByDriver,
  // updateStudentStatus
};