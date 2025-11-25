const locationService = require('../services/locationService');

const lastSaveTimes = new Map();
const saveTime = 30000;

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinScheduleRoom', (scheduleId) => {
      socket.join(scheduleId);
      console.log(`Socket: User ${socket.id} đã tham gia phòng ${scheduleId}`);
    });

    socket.on('driver_update_location', async (data) => {
      if (!data.scheduleId || !data.busId || !data.location) {
        console.error("Socket: Dữ liệu 'driver_update_location' không đầy đủ.");
        return;
      }

      io.to(data.scheduleId).emit('new_bus_location', data.location);
      const now = Date.now();
      const lastSave = lastSaveTimes.get(data.scheduleId) || 0;
      if (now - lastSave > saveTime) {
        // console.log(`Socket: Đang lưu vị trí cho schedule ${data.scheduleId} vào DB...`);
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

        } catch (err) {
          console.error(`Socket: Lỗi khi lưu vị trí vào DB: ${err.message}`);
        }
      }
    });
    socket.on('disconnect', () => {
      console.log(`Socket: User disconnected - ${socket.id}`);
    });
  });
}

module.exports = { initializeSocket };