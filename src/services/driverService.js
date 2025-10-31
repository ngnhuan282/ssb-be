const ApiError = require("../utils/apiError")
const HttpStatus = require('http-status')
const Driver = require("../models/DriverModel")
const User = require('../models/UserModel');
const mongoose = require('mongoose');

const getAllDrivers = async () => {
  const drivers = await Driver.find()
    .populate({
      path: "user",
      select: "username phone email" // lấy tên và số điện thoại
    })
    .populate('assignedBus')


  console.log("Fetched drivers:", drivers);
  console.log(drivers.map(d => ({ id: d._id, assignedBus: d.assignedBus })));
  return drivers;
}



const getDriverById = async (id) => {
  const driver = await Driver.findById(id)
    .populate({ path: "user" })
    .exec();

  if (!driver) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Driver not found');
  }
  return driver;
};

const createDriver = async (data) => {
  // 1️⃣ Tạo user trước
  const user = new User({
    username: data.fullName,
    fullName: data.fullName,
    phone: data.phoneNumber,
    email: data.email,
    password: data.password,
    role: 'driver'
  });
  const savedUser = await user.save();

  // 2️⃣ Tạo driver, gán các field đúng schema
  const driver = new Driver({
    user: savedUser._id,             // bắt buộc
    licenseNumber: data.licenseNumber, // bắt buộc
    assignedBus: data.assignedBus,     // bắt buộc
    status: data.status || 'active'
  });

  const savedDriver = await driver.save();
  await savedDriver.populate(['user', 'assignedBus']);

  return savedDriver;
};

const updateDriver = async (id, updateData) => {
  if (updateData.assignedBus) {
    updateData.assignedBus = new mongoose.Types.ObjectId(updateData.assignedBus);
  }

  const driver = await Driver.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  ).populate(['user', 'assignedBus']); // thêm populate cho trả về đầy đủ


  if (!driver) 
    throw new ApiError(HttpStatus.NOT_FOUND, 'Driver not found!');

  return driver;
};

const deleteDriver = async (id) => {
  const driver = await Driver.findByIdAndDelete(id)
  if (!driver) 
    throw new ApiError(HttpStatus.NOT_FOUND, 'Driver not found!')
  return driver
}

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
}