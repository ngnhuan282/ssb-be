const Joi = require('joi');
const HttpStatus = require('http-status');
const ApiError = require("../middlewares/errorHandlingMiddleware").default;

const createLocationSchema = Joi.object({
    busId: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    timestamp: Joi.date().default(Date.now),
    scheduleId: Joi.string().optional()
});

const updateLocationSchema = Joi.object({
    busId: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    timestamp: Joi.date().default(Date.now).optional(),
    scheduleId: Joi.string().optional()
});

const validateCreateLocation = (req, res, next) => {
    const { error } = createLocationSchema.validate(req.body)
    if (error) { throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0]) }
    next();
}

const validateUpdateLocation = (req, res, next) => {
    const { error } = updateLocationSchema.validate(req.body)
    if (error) { throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0]) }
    next();
}

module.exports = {
    validateCreateLocation,
    validateUpdateLocation
};
