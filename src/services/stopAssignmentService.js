const StopAssignment = require('../models/StopAssisgnmentModel');
const ApiError = require('../utils/apiError');
const HttpStatus = require('http-status');
const Student = require('../models/StudentModel');
const Route = require('../models/RouteModel');


const getAssignmentsByStop = async (scheduleId, stopIndex) => {
  return await StopAssignment.find({ schedule: scheduleId, stopIndex })
    .populate({
      path: 'student',
      select: 'fullName class status parent pickupPoint dropoffPoint',
      populate: {
        path: 'parent',
        select: 'user',
        populate: {
          path: 'user',
          select: 'phone'
        }
      }
    })
    .lean();
};

// === CẬP NHẬT HÀM NÀY ===
const updateAssignment = async (scheduleId, stopIndex, studentId, data) => {
  const filter = { schedule: scheduleId, stopIndex, student: studentId };

  // Logic cập nhật timestamp dựa trên status
  const update = { ...data }; // data từ body, ví dụ: { status: 'boarded' }

  if (data.status === 'boarded') {
    update.boardedAt = new Date();
    await Student.findByIdAndUpdate(studentId, { status: 'picked_up' });
  } else if (data.status === 'dropped_off') {
    update.droppedOffAt = new Date();
    await Student.findByIdAndUpdate(studentId, { status: 'dropped_off' });
  } else if (data.status === 'absent' || data.status === 'waiting') {
    await Student.findByIdAndUpdate(studentId, { status: 'pending' });
  }
  const assignment = await StopAssignment.findOneAndUpdate(
    filter,
    update,
    { new: true }
  ).populate('student');

  if (!assignment) throw new ApiError(HttpStatus.NOT_FOUND, 'Assignment not found');

  if (assignment.status === 'absent') {
    // Tìm 'dropoff' và set nó thành 'absent'
    await StopAssignment.findOneAndUpdate(
      { schedule: scheduleId, student: studentId, type: 'dropoff' },
      { status: 'absent' }
    );
  }
  // 2. Nếu bấm "Đã đón" (hoàn tác)
  else if (assignment.status === 'boarded') {
    // Tìm 'dropoff' và set nó về 'waiting'
    // (Để phòng trường hợp trước đó lỡ bấm 'absent') 
    await StopAssignment.findOneAndUpdate(
      { schedule: scheduleId, student: studentId, type: 'dropoff' },
      { status: 'waiting' }
    );
  }

  return assignment;
};

const createstopAssignment = async (schedule) => {
  try {
    const route = await Route.findById(schedule.route)
    if (!route || !route.stops) return;

    const assignments = [];
    for (const studentId of schedule.students) {
      const student = await Student.findById(studentId);
      if (!student) continue;

      const pickupIndex = route.stops.findIndex(stop => stop.location === student.pickupPoint);
      const dropoffIndex = route.stops.findIndex(stop => stop.location === student.dropoffPoint);

      if (pickupIndex >= 0) {
        assignments.push({
          schedule: schedule._id,
          student: student._id,
          stopIndex: pickupIndex,
          type: 'pickup',
          status: 'waiting'
        });
      }

      if (dropoffIndex >= 0) {
        assignments.push({
          schedule: schedule._id,
          student: student._id,
          stopIndex: dropoffIndex,
          type: 'dropoff',
          status: 'waiting'
        });
      }
    }
    if (assignments.length > 0) {
      await StopAssignment.insertMany(assignments);
    }
  } catch (err) {
    console.error("Error creating assignments:", err);
  }
};

async function deleteByScheduleId(scheduleId) {
  const result = await StopAssignment.deleteMany({ schedule: scheduleId });
  return result;
}

module.exports = { getAssignmentsByStop, updateAssignment, createstopAssignment, deleteByScheduleId };