const ApiResponse = require("../utils/apiResponse");
const HttpStatus = require('http-status-codes');
const scheduleService = require("../services/scheduleService")

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
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Create a schedule successfully!"))
    } catch (error) {
        next(error)
    }
}

const updateSchedule = async (req, res, next) => {
    try {
        const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Update schedule successfully!"))
    } catch (error) {
        next(error)
    }
}

const deleteSchedule = async (req, res, next) => {
    try {
        await scheduleService.deleteSchedule(req.params.id);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, "Update schedule successfully!"))
    } catch (error) {
        next(error)
    }
}

const updateStopStatus = async (req, res, next) => {
  try {
    const { scheduleId, stopId } = req.params;
    const updateData = req.body;
    const stop = await scheduleService.updateStopStatus(scheduleId, stopId, updateData);
    res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, stop, 'Stop updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

const updateStudentStatus = async (req, res, next) => {
  try {
    const { scheduleId, stopId, studentId } = req.params;
    const { status, boardedAt } = req.body;

    const updatedStop = await scheduleService.updateStudentStatus(
      scheduleId, stopId, studentId, { status, boardedAt }
    );

    res.status(HttpStatus.OK).json(
      new ApiResponse(HttpStatus.OK, updatedStop, 'Cập nhật trạng thái học sinh thành công')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDriver,
    updateStudentStatus,
}