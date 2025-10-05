const Joi = require('joi')
const HttpStatus = require('http-status')
const ApiError = require("../utils/apiError")


const createBusSchema = Joi.object({
  licensePlate: Joi.string().required().trim(),
  capacity: Joi.number().min(1).required(),
  currentStatus: Joi.string().valid('active', 'maintenance', 'inactive').default('active'),
  driver: Joi.string().optional(),
  route: Joi.string().optional()
})

const updateBusSchema = Joi.object({
  licensePlate: Joi.string().trim().optional(),
  capacity: Joi.number().min(1).optional(),
  currentStatus: Joi.string().valid('active', 'maintenance', 'inactive').default('active'),
  driver: Joi.string().optional(),
  route: Joi.string().optional()
})

const validateCreateBus = (req, res, next) => {
  const { error } = createBusSchema.validate(req.body, { abortEarly: false})
  if(error){
    throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message)
  }
  next()
}

const validateUpdateBus = (req, res, next) => {
    const {error} = updateBusSchema.validate(req.body, { abortEarly: false})
    if(error) {
        throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message)
    }
    next();
};


module.exports = {
    validateCreateBus,
    validateUpdateBus
};