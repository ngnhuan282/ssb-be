const handleSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    socket.on('joinBusRoom', (busId) => {
      socket.join(busId);
      console.log(`Socket ${socket.id} joined room ${busId}`);
    });

    socket.on('updateLocation', (data) => {
      io.to(data.busId).emit('locationUpdated', data);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

module.exports = { handleSocket };