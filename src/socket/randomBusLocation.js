const { mockLocationData } = require('./mockLocationData');
const Bus = require('../models/BusModel');

function randomBusLocation(io) {
  setInterval(async () => {
    try {
      const buses = await Bus.find();
      if (!buses || buses.length == 0) return;

      buses.forEach((bus) => {
        const randomLocation = mockLocationData[Math.floor(Math.random() * mockLocationData.length)];
        const data = {
          busId: bus._id.toString(),
          latitude: randomLocation.latitude,
          longitude: randomLocation.longitude
        }

        io.emit('locationUpdated', data);
      })
    } catch (error) {
      console.log("Loi emit mock location", error);
    }
  }, 10000); // cho 10 truoc de han che spam sau co the chinh lai 3000 (3s)
}

module.exports = { randomBusLocation };