const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, 
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'driver', 'parent'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware: Hash password trước khi save (CHỈ khi password mới hoặc thay đổi)
userSchema.pre('save', async (next)  =>{
  // Chỉ hash nếu password được modify
  if (!this.isModified('password')) 
    return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method: So sánh password khi login
userSchema.methods.comparePassword = async (candidatePassword) => {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method: Lấy thông tin public (không bao gồm password)
userSchema.methods.toJSON = () => {
  const userObject = this.toObject();
  delete userObject.password; // Xóa password khi return JSON
  return userObject;
};

const User = mongoose.model('User', userSchema);
module.exports = User;