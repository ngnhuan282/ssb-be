const express = require('express')
const router = express.Router()
const driverValidation = require('../../validations/driverValidation')
const driverController = require('../../controllers/driverController')

router.get('/', driverController.getAllDrivers)

router.get('/:id', driverController.getDriverById)

router.post('/', driverValidation.validateCreateDriver , driverController.createDriver)

router.put('/:id', driverValidation.validateUpdateDriver , driverController.updateDriver)

router.delete('/:id', driverController.deleteDriver)

module.exports = router
