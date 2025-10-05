const Joi = require('joi');
const HttpStatus = require('http-status');
const ApiError = require("../utils/apiError");

const createParentSchema = Joi.object({
    user: Joi.string().required(),
    boardStatus: Joi.string().valid('onboard', 'offboard').optional(),
    pickupPoint: Joi.string().trim().optional(),
    dropoffPoint: Joi.string().trim().optional(),
    children: Joi.string().required(),
    children: Joi.string().required(),
});

const updateParentSchema = Joi.object({
    user: Joi.string().required(),
    boardStatus: Joi.string().valid('onboard', 'offboard').optional(),
    pickupPoint: Joi.string().trim().optional(),
    dropoffPoint: Joi.string().trim().optional(),
    children: Joi.string().optional(),
    children: Joi.string().optional(),
});

const validateCreateParent = (req, res, next) => {
    const { error } = createParentSchema.validate(req.body);
    if (error) {
        throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
    }
    next();
};

const validateUpdateParent = (req, res, next) => {
    const { error } = updateParentSchema.validate(req.body);
    if (error) {
        throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
    }
    next();
};

module.exports = {
    validateCreateParent, validateUpdateParent
};