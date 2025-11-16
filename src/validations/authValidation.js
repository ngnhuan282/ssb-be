const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/apiError');

// Schema đăng ký
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'driver', 'parent').default('parent'),
});

// Schema đăng nhập
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Middleware ĐĂNG KÝ
const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.details[0].message });
  }
  next();
};

// Middleware ĐĂNG NHẬP
const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validateRegister, validateLogin };