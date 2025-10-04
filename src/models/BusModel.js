const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true, unique: true, trim: true },
  capacity: { type: Number, min: 1, required: true },
  currentStatus: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;