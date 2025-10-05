const HttpStatus = require('http-status')
const ApiResponse = require('../utils/apiResponse')
const busService = require('../services/busService')

const getAllBus = async (req, res, next) => {
  try {
    const bus =  await busService.getAllBus()
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, bus, 'Get all buses successfully!'))
  } catch (error) {
    next(error)
  }
}

const getBusById = async (req, res, next) => {
  try {
    const bus = await busService.getBusById(req.params.id)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, bus, 'Get bus by id successfully!'))
  } catch (error) {
    next(error)
  }
}

const createBus = async (req, res, next) => {
  try {
    const bus = await busService.createBus(req.body)
    res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, bus, 'Create bus successfully!'))
  } catch (error) {
    next(error)
  }
}

const updateBus = async (req, res, next) => {
  try {
    const bus = await busService.updateBus(req.params.id, req.body)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, bus, 'Bus updated successfully!'))
  } catch (error) {
    next(error)
  }
}

const deleteBus = async (req, res, next) => {
  try {
    await busService.deleteBus(req.params.id)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, 'Bus deleted successfully!'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllBus,
  createBus,
  getBusById,
  updateBus,
  deleteBus
}
