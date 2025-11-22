const ApiError = require("../utils/apiError");
const HttpStatus = require("http-status");
const Notification = require("../models/NotificationModel");
const Parent = require("../models/ParentModel"); // Import Parent để lấy danh sách

// ================= Notifications bình thường =================
const getAllNotifications = async () => {
  return await Notification.find()
    .populate("user busId scheduleId")
    .sort({ createdAt: -1 });
};

// [MỚI] Hàm giúp Phụ huynh lấy thông báo của chính mình
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

// ================= Incident (Emergency) =================
const getEmergencyNotifications = async () => {
  // Lấy các thông báo gốc (của tài xế gửi lên hoặc admin)
  // Thường thông báo gốc sẽ không gắn user là phụ huynh, hoặc logic tuỳ bạn
  // Ở đây ta lấy tất cả type emergency
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
      const allParents = await Parent.find({});

      if (allParents.length > 0) {
        const notificationsForEveryone = allParents.map((parent) => ({
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

        // Lưu một loạt vào DB
        await Notification.insertMany(notificationsForEveryone);
        console.log(
          `Đã gửi thông báo sự cố cho ${allParents.length} phụ huynh.`
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi thông báo hàng loạt:", error);
      // Không throw lỗi để tránh chặn luồng báo cáo của tài xế
    }
  }

  return mainNotification;
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
  getNotificationsByUserId, // Export hàm mới
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  getEmergencyNotifications,
};
