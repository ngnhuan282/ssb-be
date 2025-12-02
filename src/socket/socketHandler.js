const locationService = require('../services/locationService');

const lastSaveTimes = new Map();
const saveTime = 30000;

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // --- 1. THÊM MỚI: Cho phép Admin tham gia phòng theo dõi ---
    socket.on('joinAdminRoom', () => {
      socket.join('admin_room');
      console.log(`📡 Admin/User ${socket.id} đã tham gia phòng ADMIN_ROOM`);
    });

    // --- 2. Sự kiện Join phòng lịch trình (Giữ nguyên) ---
    socket.on('joinScheduleRoom', (scheduleId) => {
      socket.join(scheduleId);
      // console.log(`🚌 User ${socket.id} tham gia phòng lịch trình ${scheduleId}`);
    });

    // --- 3. Xử lý sự kiện cập nhật vị trí từ Tài xế ---
    socket.on('driver_update_location', async (data) => {
      if (!data.scheduleId || !data.busId || !data.location) {
        console.error("❌ Socket: Dữ liệu 'driver_update_location' thiếu thông tin.");
        return;
      }

      // Log nhẹ để biết có tin đến (Debug xong có thể comment lại)
      console.log(`📍 Nhận vị trí Bus ${data.busId} (Schedule: ${data.scheduleId})`);

      // A. Gửi cho Phụ huynh/Học sinh (trong phòng scheduleId) - Giữ nguyên logic cũ
      io.to(data.scheduleId).emit('new_bus_location', data.location);

      // B. THÊM MỚI: Gửi cho ADMIN (trong phòng admin_room)
      // Sự kiện phải tên là 'locationUpdated' để khớp với AdminMap.jsx
      io.to('admin_room').emit('locationUpdated', {
        busId: data.busId,
        location: data.location,
        scheduleId: data.scheduleId,
        status: 'active', // Hoặc lấy từ data nếu có
        lastUpdate: new Date()
      });

      // C. Logic lưu vào DB (Giữ nguyên logic cũ của bạn)
      const now = Date.now();
      const lastSave = lastSaveTimes.get(data.scheduleId) || 0;
      
      if (now - lastSave > saveTime) {
        try {
          const locationData = {
            busId: data.busId,
            scheduleId: data.scheduleId,
            latitude: data.location.lat,
            longitude: data.location.lng,
            timestamp: new Date(now)
          };
          await locationService.updateLocationByBusId(data.busId, locationData);
          lastSaveTimes.set(data.scheduleId, now);
          console.log(`💾 Đã lưu vị trí Bus ${data.busId} vào DB`);
        } catch (err) {
          console.error(`⚠️ Lỗi lưu DB: ${err.message}`);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected - ${socket.id}`);
    });
  });
}

module.exports = { initializeSocket };