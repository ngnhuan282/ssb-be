const HttpStatus = require('http-status')
const ApiResponse = require('../utils/apiResponse')
const notificationService = require('../services/notificationService')

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getAllNotifications()
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, notifications, 'Get all notifications successfully!'))
  } catch (error) {
    next(error)
  }
}

const getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(req.params.id)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, notification, 'Get notification by id successfully!'))
  } catch (error) {
    next(error)
  }
}

const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body)
    res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, notification, 'Create notification successfully!'))
  } catch (error) {
    next(error)
  }
}

const updateNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.updateNotification(req.params.id, req.body)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, notification, 'Notification updated successfully!'))
  } catch (error) {
    next(error)
  }
}

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, 'Notification deleted successfully!'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification
}
