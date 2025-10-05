const ApiError = require("../utils/apiError");
const Schedule = require("../models/ScheduleModel");
const HttpStatus = require('http-status');

const getAllSchedules = async () => {
    return await Schedule.find();
}

const getScheduleById = async (id) => {
    const schedule = await Schedule.findById(id).populate('Bus Route Driver');
    if (!schedule) throw new ApiError(HttpStatus.NOT_FOUND, 'Schedule not found');
    return schedule;
}

const createSchedule = async (scheduleData) => {
    const schedule = new Schedule(scheduleData);
    return await schedule.save();
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
    if (!route) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Route not found')
    }
    return schedule
}

const deleteSchedule = async (id) => {
    const schedule = Schedule.findByIdAndDelete(id);
    if (!schedule) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Route not found');
    }
    return schedule;
}

module.exports = {
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule
};