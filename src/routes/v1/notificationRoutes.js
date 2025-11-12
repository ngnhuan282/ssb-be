const express = require('express')
const router = express.Router()
const notificationValidation = require('../../validations/notificationValidation')
const notificationController = require('../../controllers/notificationController')

// [GET] /api/v1/notifications/incidents
router.get('/incidents', notificationController.getEmergencyNotifications);
//router.get('/incidents/:id', notificationController.getIncidentById);

router.get('/', notificationController.getAllNotifications)

router.get('/:id', notificationController.getNotificationById)

router.post('/', notificationValidation.validateCreateNotification, notificationController.createNotification)

router.put('/:id', notificationValidation.validateUpdateNotification, notificationController.updateNotification)

router.delete('/:id', notificationController.deleteNotification)

module.exports = router
