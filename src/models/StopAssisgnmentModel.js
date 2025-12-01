const mongoose = require('mongoose');

const stopAssignmentSchema = new mongoose.Schema({
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  stopIndex: {
    type: Number,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },


  // Bắt buộc phải có để phân biệt logic Đón hay Trả
  type: {
    type: String,
    enum: ['pickup', 'dropoff'],
    required: true
  },

  status: {
    type: String,
    // 'waiting': Chờ (cho cả pickup và dropoff)
    // 'boarded': Đã đón (cho pickup)
    // 'absent': Vắng mặt (cho pickup)
    // 'dropped_off': Đã trả (cho dropoff)
    enum: ['waiting', 'boarded', 'absent', 'dropped_off'],
    required: true,
    default: 'waiting'
  },


  boardedAt: { type: Date }, // Thời điểm đón
  droppedOffAt: { type: Date }, // Thời điểm trả
  createdAt: { type: Date, default: Date.now }
});

stopAssignmentSchema.index({ schedule: 1, stopIndex: 1, type: 1 });
stopAssignmentSchema.index({ student: 1, schedule: 1 });

module.exports = mongoose.model('StopAssignment', stopAssignmentSchema);