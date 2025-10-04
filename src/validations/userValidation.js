const Joi = require('joi');
const ApiError = require("../utils/apiError");
const HttpStatus = require('http-status');

const createUserSchema = Joi.object({
    username: Joi.string().trim().required(),
    password: Joi.string().trim().min(6).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().optional(),
    role: Joi.string().valid('admin', 'driver', 'parent').required()
});

const updateUserSchema = Joi.object({
    username: Joi.string().trim().optional(),
    password: Joi.string().min(6).optional(), 
    email: Joi.string().email().trim().lowercase().optional(),
    phone: Joi.string().trim().optional(),
    role: Joi.string().valid('admin', 'driver', 'parent').optional(),
});

const validateCreateUser = (req, res, next) => {
    const {error} = createUserSchema.validate(req.body);
    if(error) {
        throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
    }
    next();
};

const validateUpdateUser = (req, res, next) => {
    const {error} = updateUserSchema.validate(req.body);
    if(error) {
        throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
    }
    next();
};

module.exports = {
    validateCreateUser,
    validateUpdateUser,
}