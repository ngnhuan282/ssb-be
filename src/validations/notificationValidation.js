const Joi = require('joi')
const ApiError = require('../utils/apiError')
const HttpStatus = require('http-status')

const createNotificationSchema = Joi.object({
  user: Joi.string().required(),
  type: Joi.string().valid('arrival', 'delay', 'emergency', 'message', 'no_emergency', 'resolved_emergency').required(),
  message: Joi.string().required(),
  busId: Joi.string().optional(),
  scheduleId: Joi.string().optional(),
  read: Joi.boolean().default(false),
  location: Joi.string().optional(),
  dateTime: Joi.date().optional()
})

const updateNotificationSchema = Joi.object({
  user: Joi.string().optional(),
  type: Joi.string().valid('arrival', 'delay', 'emergency', 'message').optional(),
  message: Joi.string().optional(),
  busId: Joi.string().optional(), 
  scheduleId: Joi.string().optional(),
  read: Joi.boolean().optional()
})

const createIncidentSchema = Joi.object({
  user: Joi.string().required(),
  type: Joi.string().valid('emergency','no_emergency').required(),
  emergency_type: Joi.string().valid('Tai nạn', 'Tắc đường', 'Hỏng xe', 'Sự cố học sinh', 'Khác').required(),
  message: Joi.string().required(),
  location: Joi.string().required(),
  dateTime: Joi.date().default(Date.now),
  busId: Joi.string().optional(),
  scheduleId: Joi.string().optional(),
  status: Joi.string().valid('pending','urgent','resolved').optional(),
  read: Joi.boolean().default(false)
});

const updateIncidentSchema = Joi.object({
  user: Joi.string().optional(),
  type: Joi.string().valid('emergency','no_emergency').optional(),
  emergency_type: Joi.string().valid('Tai nạn', 'Tắc đường', 'Hỏng xe', 'Sự cố học sinh', 'Khác').optional(),
  message: Joi.string().optional(),
  location: Joi.string().optional(),
  dateTime: Joi.date().optional(),
  busId: Joi.string().optional(),
  scheduleId: Joi.string().optional(),
  status: Joi.string().valid('pending','urgent','resolved').optional(),
  read: Joi.boolean().optional()
});

const validateCreateNotification = (req, res, next) => {
  const { error } = createNotificationSchema.validate(req.body, { abortEarly: false })
  if (error) throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message)
  next()
}

const validateUpdateNotification = (req, res, next) => {
  const { error } = updateNotificationSchema.validate(req.body, { abortEarly: false })
  if (error) throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message)
  next()
}

const validateCreateIncident = (req, res, next) => {
  const { error } = createIncidentSchema.validate(req.body, { abortEarly: false });
  if (error) throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
  next();
};

const validateUpdateIncident = (req, res, next) => {
  const { error } = updateIncidentSchema.validate(req.body, { abortEarly: false });
  if (error) throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
  next();
};

module.exports = {
  validateCreateNotification,
  validateUpdateNotification,
  validateCreateIncident,
  validateUpdateIncident
}
