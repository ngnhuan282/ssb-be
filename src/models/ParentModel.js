const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Liên kết với User
  boardstatus: { type: String, enum: ['onboard', 'offboard'], default: 'offboard' }, // Trạng thái lên/xuống xe của con
  pickuppoint: { type: String, trim: true }, 
  dropoffpoint: { type: String, trim: true }, 
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }], // Danh sách học sinh
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const Parent = mongoose.model('Parent', parentSchema);
module.exports = Parent;