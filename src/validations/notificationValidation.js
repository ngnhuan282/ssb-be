const Joi = require('joi')
const ApiError = require('../utils/apiError')
const HttpStatus = require('http-status')

const createNotificationSchema = Joi.object({
  user: Joi.string().required(),
  type: Joi.string().valid('arrival', 'delay', 'emergency', 'message').required(),
  message: Joi.string().required(),
  busId: Joi.string().optional(),
  scheduleId: Joi.string().optional(),
  read: Joi.boolean().default(false)
})

const updateNotificationSchema = Joi.object({
  user: Joi.string().optional(),
  type: Joi.string().valid('arrival', 'delay', 'emergency', 'message').optional(),
  message: Joi.string().optional(),
  busId: Joi.string().optional(), 
  scheduleId: Joi.string().optional(),
  read: Joi.boolean().optional()
})

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

module.exports = {
  validateCreateNotification,
  validateUpdateNotification
}
