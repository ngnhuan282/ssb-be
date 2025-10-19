const Joi = require("joi");
const HttpStatus = require('http-status');
const ApiError = require("../utils/apiError");

const createScheduleSchema = Joi.object({
    bus: Joi.string().required(),
    route: Joi.string().required(),
    driver: Joi.string().required(),
    date: Joi.date().required(),
    starttime: Joi.date().required(),
    endtime: Joi.date().required(),
    nestudent: Joi.number().min(0),
    frequency: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
    students: Joi.array().items(Joi.string()),
    status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'delayed').default('scheduled'),
});

const updateScheduleSchema = Joi.object({
    bus: Joi.string().optional(),
    route: Joi.string().optional(),
    driver: Joi.string().optional(),
    date: Joi.date().optional(),
    starttime: Joi.date().optional(),
    endtime: Joi.date().optional(),
    nestudent: Joi.number().min(0),
    frequency: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
    students: Joi.array().items(Joi.string()),
    status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'delayed').default('scheduled'),
});

const validateCreateSchedule = (req, res, next) => {
    const { error } = createScheduleSchema.validate(req.body);
    if (error) { throw new ApiError(HttpStatus.BAD_REQUEST, error.message) }
    next();
}

const validateUpdateSchedule = (req, res, next) => {
    const { error } = updateScheduleSchema.validate(req.body);
    if (error) { throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0]) }
    next();
}

module.exports = {
    validateCreateSchedule,
    validateUpdateSchedule
}