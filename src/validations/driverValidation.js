const Joi = require('joi');
const ApiError = require('../utils/apiError');
const HttpStatus = require('http-status');


const createDriverSchema = Joi.object({
  fullName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  licenseNumber: Joi.string().required(),
  assignedBus: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive').default('active')
});

const updateDriverSchema = Joi.object({
  user: Joi.string().optional(),
  fullName: Joi.string().min(2).max(100),
  phoneNumber: Joi.string().pattern(/^[0-9]+$/),
  email: Joi.string().email(),
  password: Joi.string().min(6).optional(),  // ✅ thêm dòng này
  licenseNumber: Joi.string().trim().optional(),
  assignedBus: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive').optional()
});

const validateCreateDriver = (req, res, next) => {
  const { error } = createDriverSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
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
