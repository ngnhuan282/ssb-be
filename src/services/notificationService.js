const ApiError = require('../utils/apiError')
const HttpStatus = require('http-status')
const Notification = require('../models/NotificationModel')

const getAllNotifications = async () => {
  return await Notification.find().populate('user busId scheduleId')
}

const getNotificationById = async (id) => {
  const notification = await Notification.findById(id).populate('user busId scheduleId')
  if (!notification) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Notification not found!')
  }
  return notification
}

const getEmergencyNotifications = async () => {
  // Lấy cả emergency, no_emergency, resolved_emergency
  const notifications = await Notification.find({ type: { $in: ['emergency', 'no_emergency', 'resolved_emergency'] } })
    .populate('user busId scheduleId')
    .sort({ createdAt: -1 });

  // Gán status dựa vào type
  return notifications.map(n => {
    const obj = n.toObject();
    if (obj.type === 'no_emergency') return { ...obj, status: 'pending' };
    if (obj.type === 'resolved_emergency') return { ...obj, status: 'resolved' };
    // Mặc định emergency là urgent
    return { ...obj, status: 'urgent' };
  });
};



const createNotification = async (data) => {
  const notification = new Notification(data)
  return await notification.save()
}

const updateNotification = async (id, updateData) => {
  const notification = await Notification.findByIdAndUpdate(
    id,
    { ...updateData },
    { new: true, runValidators: true }
  )
  if (!notification) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Notification not found!')
  }
  return notification
}

const deleteNotification = async (id) => {
  const notification = await Notification.findByIdAndDelete(id)
  if (!notification) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Notification not found!')
  }
  return notification
}

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  getEmergencyNotifications 
}
