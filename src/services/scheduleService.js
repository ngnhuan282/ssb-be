const ApiError = require("../utils/apiError");
const Schedule = require("../models/ScheduleModel");
const HttpStatus = require('http-status');

const getAllSchedules = async () => {
    return await Schedule.find().populate('bus route').populate({
        path: 'driver',
        populate: { path: 'user' }
    });
}

const getScheduleById = async (id) => {
    const schedule = await Schedule.findById(id).populate('bus route driver');
    if (!schedule) throw new ApiError(HttpStatus.NOT_FOUND, 'Schedule not found');
    return schedule;
}

const createSchedule = async (scheduleData) => {
    const schedule = new Schedule(scheduleData);
    return (await schedule.save()).populate(['bus', 'route', 'driver']);
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
    return schedule.populate(['bus', 'route', 'driver']);
}

const deleteSchedule = async (id) => {
    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Schedule not found');
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