const Joi = require('joi');
const HttpStatus = require('http-status');
const ApiError = require("../utils/apiError");

const createStudentSchema = Joi.object({
  fullName: Joi.string().required().trim(),
  age: Joi.number().min(0).optional(),
  class: Joi.string().trim().optional(),
  parent: Joi.string().required(),
  route: Joi.string().required(),
  pickupPoint: Joi.string().required().trim(),
  dropoffPoint: Joi.string().required().trim(),
  status: Joi.string().valid('pending', 'picked_up', 'dropped_off').optional(),
});

const updateStudentSchema = Joi.object({
  fullName: Joi.string().trim().optional(),
  age: Joi.number().min(0).optional(),
  class: Joi.string().trim().optional(),
  parent: Joi.string().optional(),
  route: Joi.string().optional(),
  pickupPoint: Joi.string().trim().optional(),
  dropoffPoint: Joi.string().trim().optional(),
  status: Joi.string().valid('pending', 'picked_up', 'dropped_off').optional(),
});

const validateCreateStudent = (req, res, next) => {
  const { error } = createStudentSchema.validate(req.body);
  if (error) {
    throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
  }
  next();
};

const validateUpdateStudent = (req, res, next) => {
  const { error } = updateStudentSchema.validate(req.body);
  if (error) {
    throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
  }
  next();
};

module.exports = {
  validateCreateStudent,
  validateUpdateStudent,
};