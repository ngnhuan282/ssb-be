const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  age: { type: Number, min: 0 },
  class: { type: String, trim: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  pickupPoint: { type: String, required: true },
  dropoffPoint: { type: String, required: true },
  status: { type: String, enum: ['pending', 'picked_up', 'dropped_off'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const Student = mongoose.model('Student', studentSchema);
module.exports = Student;