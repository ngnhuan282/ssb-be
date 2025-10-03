const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true, unique: true, trim: true },
  model: { type: String, trim: true },
  capacity: { type: Number, min: 1, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }, 
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;