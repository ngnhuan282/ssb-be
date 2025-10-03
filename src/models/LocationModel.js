const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  speed: { type: Number, min: 0 },
  timestamp: { type: Date, default: Date.now },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' }
});


const Location = mongoose.model('Location', locationSchema);
module.exports = Location;