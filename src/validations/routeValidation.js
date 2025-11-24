const Joi = require('joi');
const HttpStatus = require('http-status');
const ApiError = require("../utils/apiError")

const createRouteSchema = Joi.object({
    name: Joi.string().required().trim(),
    stops: Joi.array().items(
        Joi.object({
            location: Joi.string().required().trim(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            time: Joi.date().default(Date.now)
        })
    ).min(1).required(),
    distance: Joi.number().min(0).required(),
    estimatedTime: Joi.number().min(0).required(),
    assignedBus: Joi.string().required()
})

const updateRouteSchema = Joi.object({
    name: Joi.string().required().trim(),
    stops: Joi.array().items(
        Joi.object({
            location: Joi.string().required().trim(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            time: Joi.date().default(Date.now)
        })
    ).min(1).required(),
    distance: Joi.number().min(0).required(),
    estimatedTime: Joi.number().min(0).required(),
    assignedBus: Joi.string().required()
})

const validateCreateRoute = (req, res, next) => {
    const { error } = createRouteSchema.validate(req.body);
    if (error) { throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message) }
    next();
}

const validateUpdateRoute = (req, res, next) => {
    const { error } = updateRouteSchema.validate(req.body);
    if (error) { throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message) }
    next();
}

module.exports = {
    validateCreateRoute,
    validateUpdateRoute
}