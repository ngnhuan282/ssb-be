const ApiError = require("../utils/apiError")
const HttpStatus = require('http-status')
const Bus = require("../models/BusModel")

const getAllBus = async () => {
  return await Bus.find().populate('driver route')
}

const getBusById =  async (id) => {
  const bus =  await Bus.findById(id).populate('driver route')
  if(!bus){
    throw new ApiError(HttpStatus.NOT_FOUND,'Bus not found!')
  }
  return bus
}

const createBus = async (busData) => {
  const bus = new Bus(busData);
  const savedBus = await bus.save();
  await savedBus.populate(['driver', 'route']);
  return savedBus;
};

const updateBus = async (id, updateData) => {
    const bus = await Bus.findByIdAndUpdate(
      id,
       { ...updateData, updatedAt: Date.now()},
       {new: true, runValidators: true}
    )
    if(!bus)
        throw new ApiError(HttpStatus.NOT_FOUND, 'Bus not found!')
     await bus.populate(['driver', 'route']);
    return bus
}

const deleteBus = async (id) => {
  const bus = await Bus.findByIdAndDelete(id)
  if(!bus){
    throw new ApiError(HttpStatus.NOT_FOUND, 'Bus not found!')
  }
  return bus
}

module.exports = {
  getAllBus,
  createBus,
  getBusById,
  updateBus,
  deleteBus
}

