// ConsolidatedModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'driver', 'parent'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware: Hash password before saving (only when password is new or modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Role Schema
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['admin', 'driver', 'parent'] }
});

// Bus Schema
const busSchema = new mongoose.Schema({
  licensePlate: { type: String, required: true, unique: true, trim: true },
  capacity: { type: Number, min: 1, required: true },
  currentStatus: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Route Schema
const routeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  stops: [{
    location: { type: String, required: true },
    time: { type: Date }
  }],
  distance: { type: Number, min: 0 },
  estimatedTime: { type: Number, min: 0 },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Student Schema
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

// Parent Schema
const parentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boardStatus: { type: String, enum: ['onboard', 'offboard'], default: 'offboard' },
  pickupPoint: { type: String, trim: true },
  dropoffPoint: { type: String, trim: true },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Driver Schema
const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licenseNumber: { type: String, required: true, trim: true },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Schedule Schema
const scheduleSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  date: { type: Date, required: true },
  starttime: { type: Date, required: true },
  endtime: { type: Date, required: true },
  numstudent: { type: Number, min: 0 },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'delayed'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['arrival', 'delay', 'emergency', 'message'], required: true },
  message: { type: String, required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Location Schema
const locationSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' }
});

// Model Definitions
const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);
const Bus = mongoose.model('Bus', busSchema);
const Route = mongoose.model('Route', routeSchema);
const Student = mongoose.model('Student', studentSchema);
const Parent = mongoose.model('Parent', parentSchema);
const Driver = mongoose.model('Driver', driverSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Location = mongoose.model('Location', locationSchema);

// Export Models
module.exports = {
  User,
  Role,
  Bus,
  Route,
  Student,
  Parent,
  Driver,
  Schedule,
  Notification,
  Location
};