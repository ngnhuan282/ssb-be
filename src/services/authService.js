// authService.js (CommonJS version)
const User = require('../models/UserModel');
const Driver = require('../models/DriverModel');
const Parent = require('../models/ParentModel');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { StatusCodes } = require('http-status-codes');

const findUserByEmail = async (email) => {
  // console.log('🔍 Finding user by email:', email);
  const user = await User.findOne({ email });
  // console.log('🔍 User found:', user ? `Yes (${user._id})` : 'No');
  return user;
};

const getFullUserInfo = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    let additionalInfo = null;
    switch (user.role) {
      case 'driver':
        additionalInfo = await Driver.findOne({ user: userId })
          .populate('assignedBus')
          .lean();
        break;
      case 'parent':
        additionalInfo = await Parent.findOne({ user: userId })
          .populate('children')
          .lean();
        break;
      case 'admin':
        break;
      default:
        break;
    }
    return { ...user.toObject(), additionalInfo };
  } catch (error) {
    throw error;
  }
};

const validateCredentials = async (email, password) => {
  // console.log('🔐 Validating credentials for email:', email);
  // console.log('🔐 Password received:', password ? `Yes (${password.length} chars)` : 'No');

  const user = await findUserByEmail(email);

  if (!user) {
    console.log('❌ User not found in database');
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!');
  }

  // console.log('🔐 User found, comparing password...');
  const isPasswordValid = await user.comparePassword(password);
  // console.log('🔐 Password valid:', isPasswordValid ? 'Yes' : 'No');

  if (!isPasswordValid) {
    console.log('❌ Password mismatch');
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!');
  }

  // console.log('✅ Credentials validated successfully');
  return user;
};

//driver id 
const getDriverProfileByUserId = async (userId) => {
  console.log('🔍 Finding driver profile for user ID:', userId);

  // Chỉ lấy trường _id cho hiệu suất
  const driver = await Driver.findOne({ user: userId }).select('_id').lean();

  if (!driver) {
    console.warn(`⚠️ No driver profile found for user ID: ${userId}`);
    return null;
  }

  console.log('🔍 Driver profile found:', driver._id);
  return driver;
};

module.exports = {
  validateCredentials,
  getFullUserInfo,
  findUserByEmail,
  getDriverProfileByUserId
};