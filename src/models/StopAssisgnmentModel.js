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
  status: { 
    type: String, 
    enum: ['waiting', 'boarded', 'absent'], 
    default: 'waiting' 
  },
  boardedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Index để query nhanh
stopAssignmentSchema.index({ schedule: 1, stopIndex: 1 });
stopAssignmentSchema.index({ student: 1 });

module.exports = mongoose.model('StopAssignment', stopAssignmentSchema);