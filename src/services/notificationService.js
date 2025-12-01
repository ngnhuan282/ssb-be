const ApiError = require("../utils/apiError");
const HttpStatus = require("http-status");
const Notification = require("../models/NotificationModel");
const Parent = require("../models/ParentModel");

const getAllNotifications = async () => {
  return await Notification.find()
    .populate("user busId scheduleId")
    .sort({ createdAt: -1 });
};

const getNotificationsByUserId = async (userId) => {
  return await Notification.find({ user: userId })
    .populate("busId scheduleId")
    .sort({ createdAt: -1 });
};

const getNotificationById = async (id) => {
  const notification = await Notification.findById(id).populate(
    "user busId scheduleId"
  );
  if (!notification) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Notification not found!");
  }
  return notification;
};

const getEmergencyNotifications = async () => {
  const notifications = await Notification.find({
    type: { $in: ["emergency", "no_emergency", "resolved_emergency"] },
  })
    .populate("user busId scheduleId")
    .sort({ createdAt: -1 });

  return notifications.map((n) => {
    const obj = n.toObject();
    if (obj.type === "no_emergency") return { ...obj, status: "pending" };
    if (obj.type === "resolved_emergency")
      return { ...obj, status: "resolved" };
    return { ...obj, status: "urgent" };
  });
};

const createNotification = async (data) => {
  if (["emergency", "no_emergency"].includes(data.type) && !data.status) {
    data.status = data.type === "emergency" ? "urgent" : "pending";
  }

  const mainNotification = await new Notification(data).save();

  if (data.type === "emergency") {
    try {
      const duplicateCheck = await Notification.findOne({
        user: data.user,
        type: "emergency",
        message: data.message,
        createdAt: { $gte: new Date(Date.now() - 3000) },
      });

      if (duplicateCheck) {
        console.log("⛔ Bỏ qua vì phát hiện duplicate.");
        return mainNotification;
      }

      const allParents = await Parent.find({
        user: { $ne: data.user }  // loại chính người gửi
      });

      if (allParents.length > 0) {
        const notificationsBatch = allParents.map((parent) => ({
          user: parent.user,
          type: data.type,
          message: data.message,
          emergency_type: data.emergency_type,
          location: data.location,
          dateTime: data.dateTime || new Date(),
          busId: data.busId,
          scheduleId: data.scheduleId,
          status: "urgent",
          read: false,
          images: data.images || [],
        }));

        await Notification.insertMany(notificationsBatch);
      }

    } catch (error) {
      console.error("❌ Lỗi khi gửi thông báo hàng loạt:", error);
    }
  }

  return mainNotification;
};


const createNotificationForOneUser = async ({ user, type, message }) => {
  const notification = new Notification({
    user,
    type,
    message, 
  });
  return await notification.save();
};

const createNotificationsForUsers = async ({ userIds, type, message }) => {
  const notiList = userIds.map((id) => ({
    user: id,
    type,
    message,
  }));
  return await Notification.insertMany(notiList);
};

const updateNotification = async (id, updateData) => {
  const notification = await Notification.findByIdAndUpdate(
    id,
    { ...updateData },
    { new: true, runValidators: true }
  );
  if (!notification) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Notification not found!");
  }
  return notification;
};

const deleteNotification = async (id) => {
  const notification = await Notification.findByIdAndDelete(id);
  if (!notification) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Notification not found!");
  }
  return notification;
};

module.exports = {
  getAllNotifications,
  getNotificationsByUserId,
  getNotificationById,
  createNotification,
  createNotificationForOneUser,
  createNotificationsForUsers,
  updateNotification,
  deleteNotification,
  getEmergencyNotifications,
};
