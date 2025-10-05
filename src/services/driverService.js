const ApiError = require("../utils/apiError")
const HttpStatus = require('http-status')
const Driver = require("../models/DriverModel")

const getAllDrivers = async () => {
  return await Driver.find().populate('user assignedBus')
}

const getDriverById = async (id) => {
  const driver = await Driver.findById(id).populate('user assignedBus')
  if (!driver) 
    throw new ApiError(HttpStatus.NOT_FOUND, 'Driver not found!')
  return driver
}

const createDriver = async (driverData) => {
  const driver = new Driver(driverData)
  return await driver.save()
}

const updateDriver = async (id, updateData) => {
  const driver = await Driver.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  )
  if (!driver) 
    throw new ApiError(HttpStatus.NOT_FOUND, 'Driver not found!')
  return driver;
}

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