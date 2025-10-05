const express = require('express');
const router = express.Router();

const locationController = require('../../controllers/locationController');
const locationValidation = require('../../validations/locationValidation');

router.get('/', locationController.getAllLocation);

router.get('/:id', locationController.getLocationById);

router.post('/', locationValidation.validateCreateLocation, locationController.createLocation);

router.put('/:id', locationValidation.validateUpdateLocation, locationController.updateLocation);

router.delete('/:id', locationController.deleteLocation);

module.exports = router;