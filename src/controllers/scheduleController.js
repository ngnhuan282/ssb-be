const ApiResponse = require("../utils/apiResponse");
const HttpStatus = require('http-status-codes');
const scheduleService = require("../services/scheduleService")
const stopAssignmentService = require('../services/stopAssignmentService');
const ApiError = require('../utils/apiError');
const Student = require('../models/StudentModel');
const Notification = require('../models/NotificationModel')
const Driver = require('../models/DriverModel')
const Parent = require('../models/ParentModel')

const getAllSchedules = async (req, res, next) => {
  try {
    const schedule = await scheduleService.getAllSchedules();
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Get all schedules successfully!"));
  } catch (error) {
    next(error)
  }
}

const getSchedulesByDriver = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const schedules = await scheduleService.getSchedulesByDriver(driverId);
    res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, schedules, 'Schedules retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await scheduleService.getScheduleById(req.params.id);
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Get schedule by id successfully!"))
  } catch (error) {
    next(error)
  }
}

const createSchedule = async (req, res, next) => {
  try {
    const schedule = await scheduleService.createSchedule(req.body);
    await sendScheduleNotification(schedule, "create")

    // tao stopAssignment
    await stopAssignmentService.createstopAssignment(schedule);

    if (schedule.status === 'in_progress') {
      await resetStudentStatuses(schedule);
    }

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Create a schedule successfully!"))
  } catch (error) {
    next(error)
  }
}

// const updateSchedule = async (req, res, next) => {
//   try {

//     const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
//     await stopAssignmentService.deleteByScheduleId(req.params.id);
//     await stopAssignmentService.createstopAssignment(schedule);
//     res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Update schedule successfully!"))
//   } catch (error) {
//     next(error)
//   }
// }

const updateSchedule = async (req, res, next) => {
  try {
    const scheduleId = req.params.id;
    const updateData = req.body;

    const oldSchedule = await scheduleService.getScheduleById(scheduleId);

    const studentsChanged = updateData.students && (oldSchedule.students.length !== updateData.students.length || !oldSchedule.students.every((student) =>
      updateData.students.includes(student._id.toString())
    ));

    const routeChanged = updateData.route && oldSchedule.route._id.toString() !== updateData.route;

    if ((studentsChanged || routeChanged) && oldSchedule.status === 'in_progress') {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'Không thể thay đổi học sinh hoặc tuyến đường của lịch trình đang chạy. Hãy tạm dừng (Delayed) lịch trình trước.');
    }

    const newSchedule = await scheduleService.updateSchedule(scheduleId, updateData);
    await sendScheduleNotification(newSchedule, "update")

    if (updateData.status === 'in_progress' && oldSchedule.status !== 'in_progress') {
      await resetStudentStatuses(newSchedule);
      await stopAssignmentService.deleteByScheduleId(scheduleId);
      await stopAssignmentService.createstopAssignment(newSchedule);
    } else if (studentsChanged || routeChanged) {
      await stopAssignmentService.deleteByScheduleId(scheduleId);
      await stopAssignmentService.createstopAssignment(newSchedule);
    }
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, newSchedule, "Update schedule successfully!"))
  } catch (error) {
    next(error)
  }
}

const deleteSchedule = async (req, res, next) => {
  try {
    await stopAssignmentService.deleteByScheduleId(req.params.id);
    await scheduleService.deleteSchedule(req.params.id);
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, "Update schedule successfully!"))
  } catch (error) {
    next(error)
  }
}

const resetStudentStatuses = async (schedule) => {
  const studentIds = schedule.students.map((s) => s._id || s);
  if (studentIds.length > 0) {
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { status: 'pending' } }
    );
  }
}

const sendScheduleNotification = async (schedule, action) => {
  try {
    // Lấy tài xế
    const driver = await Driver.findById(schedule.driver).populate("user");
    const parentIds = schedule.students
      .map(s => s.parent)
      .filter(Boolean); // loại undefined/null nếu có

    const parents = await Parent.find({
      _id: { $in: parentIds }
    }).populate("user");

    console.log(parents)

    const notifications = [];

    const message = action === "create"
      ? `Bạn được phân công chuyến: ${schedule.route?.name || "Chuyến xe mới"}`
      : `Lịch của chuyến ${schedule.route?.name || ""} vừa được cập nhật`;

    // Tạo thông báo cho tài xế
    if (driver?.user) {
      notifications.push({
        user: driver.user._id,
        type: "schedule_update",
        message,
        busId: schedule.bus,
        scheduleId: schedule._id,
      });
    }

    // Tạo thông báo cho phụ huynh
    parents.forEach(parent => {
      notifications.push({
        user: parent.user._id,
        type: "schedule_update",
        message: "Lịch đưa đón của bé đã được cập nhật",
        scheduleId: schedule._id,
      });
    });

    await Notification.insertMany(notifications);
    console.log("Created notifications:", notifications.length);

  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByDriver,
}