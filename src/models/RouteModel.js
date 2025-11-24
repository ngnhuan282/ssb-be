const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  stops: [{
    location: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    time: { type: Date }
  }],
  distance: { type: Number, min: 0 },
  estimatedTime: { type: Number, min: 0 },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;