const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['arrival', 'delay', 'emergency', 'message', 'no_emergency', 'resolved_emergency'], 
    required: true 
  },  
  message: { type: String, required: true },

  // Fields cho Incident
  emergency_type: { 
    type: String, 
    enum: ['Tai nạn', 'Tắc đường', 'Hỏng xe', 'Sự cố học sinh', 'Khác'] 
  },
  location: { type: String },
  dateTime: { type: Date },

  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  status: { type: String, enum: ['pending','urgent','resolved'] },
  read: { type: Boolean, default: false },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
  
});


const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;