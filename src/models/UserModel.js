const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true }, 
  phone: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'driver', 'parent'], required: true },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }, 
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const User = mongoose.model('User', userSchema);
module.exports = User;