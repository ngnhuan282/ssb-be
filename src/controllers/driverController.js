const HttpStatus = require('http-status-codes');
const ApiResponse = require('../utils/apiResponse')
const driverService = require('../services/driverService')

const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers()
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, drivers, 'Get all drivers successfully!'))
  } catch (error) {
    next(error)
  }
}

const getDriverById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, driver, 'Get driver by id successfully!'))
  } catch (error) {
    next(error)
  }
}

const createDriver = async (req, res, next) => {
  try {
    const driver = await driverService.createDriver(req.body)
    res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, driver, 'Create driver successfully!'))
  } catch (error) {
    next(error)
  }
}

const updateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, driver, 'Driver updated successfully!'))
  } catch (error) {
    next(error)
  }
}

const deleteDriver = async (req, res, next) => {
  try {
    await driverService.deleteDriver(req.params.id)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, 'Driver deleted successfully!'))
  } catch (error) {
    next(error)
  }
}


module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
}