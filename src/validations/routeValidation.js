const Joi = require('joi');
const HttpStatus = require('http-status');
const ApiError = require("../middlewares/errorHandlingMiddleware").default;

const createRouteSchema = Joi.object({
    name: Joi.string().required().trim(),
    stop: Joi.array().items(
        Joi.object({
            stop: Joi.string().required().trim(),
            time: Joi.date().timestamp('javascript').default(Date.now)
        })
    ).min(1).required(),
    distance: Joi.number().min(0).required(),
    estimatedTime: Joi.number().min(0).required(),
    assignedBus: Joi.string().required()
})

const updateRouteSchema = Joi.object({
    name: Joi.string().required().trim(),
    stop: Joi.array().items(
        Joi.object({
            stop: Joi.string().required().trim(),
            time: Joi.date().timestamp('javascript').default(Date.now)
        })
    ).min(1).required(),
    distance: Joi.number().min(0).required(),
    estimatedTime: Joi.number().min(0).required(),
    assignedBus: Joi.string().required()
})

const validateCreateRoute = (req, res, next) => {
    const { error } = createRouteSchema.validate(req.body);
    if (error) { throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0]) }
    next();
}

const validateUpdateRoute = (req, res, next) => {
    const { error } = updateRouteSchema.validate(req.body);
    if (error) { throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0]) }
    next();
}

module.exports = {
    validateCreateRoute,
    validateUpdateRoute
}