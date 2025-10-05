const express = require('express')
const router = express.Router()
const busValidation = require("../../validations/busValidation")
const busController = require("../../controllers/busController")

router.get('/', busController.getAllBus)

router.get('/:id', busController.getBusById)

router.post('/',busValidation.validateCreateBus, busController.createBus)

router.put('/:id', busValidation.validateUpdateBus, busController.updateBus)

router.delete('/:id', busController.deleteBus)


module.exports = router