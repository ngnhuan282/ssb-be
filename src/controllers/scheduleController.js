const ApiResponse = require("../utils/apiError");
const HttpStatus = require("http-status");
const scheduleService = require("../services/scheduleService")

const getAllSchedules = async (req, res, next) => {
    try {
        const schedule = scheduleService.getAllSchedules();
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Get all schedules successfully!"));
    } catch (error) {
        next(error)
    }
}

const getScheduleById = async (req, res, next) => {
    try {
        const schedule = scheduleService.getScheduleById(req.params.id);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Get schedule by id successfully!"))
    } catch (error) {
        next(error)
    }
}

const createSchedule = async (req, res, next) => {
    try {
        const schedule = scheduleService.createSchedule(req.body);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Create a schedule successfully!"))
    } catch (error) {
        next(error)
    }
}

const updateSchedule = async (req, res, next) => {
    try {
        const schedule = scheduleService.updateSchedule(req.params.id, req.body);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, schedule, "Update schedule successfully!"))
    } catch (error) {
        next(error)
    }
}

const deleteSchedule = async (req, res, next) => {
    try {
        const schedule = scheduleService.deleteSchedule(req.params.id);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, "Update schedule successfully!"))
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule
}