const Joi = require('joi');
const ApiError = require('../utils/apiError');
const HttpStatus = require('http-status');


const createDriverSchema = Joi.object({
  user: Joi.string().required(),
  licenseNumber: Joi.string().required().trim(),
  assignedBus: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive').default('active')
});

const updateDriverSchema = Joi.object({
  user: Joi.string().optional(),
  licenseNumber: Joi.string().trim().optional(),
  assignedBus: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive').optional()
});

const validateCreateDriver = (req, res, next) => {
  const { error } = createDriverSchema.validate(req.body, { abortEarly: false});
  if (error) throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
  next();
};

const validateUpdateDriver = (req, res, next) => {
  const { error } = updateDriverSchema.validate(req.body, { abortEarly: false});
  if (error) throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
  next();
};

module.exports = {
  validateCreateDriver,
  validateUpdateDriver
};
