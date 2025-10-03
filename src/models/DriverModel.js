const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licensenumber: { type: String, required: true, trim: true }, 
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true }, 
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;