const express = require('express')
const router = express.Router()
const notificationValidation = require('../../validations/notificationValidation')
const notificationController = require('../../controllers/notificationController')

router.get('/', notificationController.getAllNotifications)

router.get('/:id', notificationController.getNotificationById)

router.post('/', notificationValidation.validateCreateNotification, notificationController.createNotification)

router.put('/:id', notificationValidation.validateUpdateNotification, notificationController.updateNotification)

router.delete('/:id', notificationController.deleteNotification)

module.exports = router
