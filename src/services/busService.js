const ApiError = require("../utils/apiError");
const HttpStatus = require("http-status");
const Bus = require("../models/BusModel");

const getAllBus = async () => {
<<<<<<< HEAD
  return await Bus.find().populate("driver route");
};

const getBusById = async (id) => {
  const bus = await Bus.findById(id).populate("driver route");
  if (!bus) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Bus not found!");
  }
  return bus;
};

const createBus = async (busData) => {
  const bus = new Bus(busData);
  return await bus.save();
=======
  return await Bus.find().populate('route').populate({ path: "driver", populate: { path: "user" } })
}

const getBusById = async (id) => {
  const bus = await Bus.findById(id).populate('route').populate({ path: "driver", populate: { path: "user" } })
  if (!bus) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Bus not found!')
  }
  return bus
}
const createBus = async (busData) => {
  const bus = new Bus(busData);
  const savedBus = await bus.save();
  await savedBus.populate('route')
  await savedBus.populate({ path: "driver", populate: { path: "user" } });
  return savedBus;
>>>>>>> 99c9ae0e7ad2a026bc14f99fc0978d6411cf701c
};

const updateBus = async (id, updateData) => {
  const bus = await Bus.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
<<<<<<< HEAD
  );
  if (!bus) throw new ApiError(HttpStatus.NOT_FOUND, "Bus not found!");
  return bus;
};

const deleteBus = async (id) => {
  const bus = await Bus.findByIdAndDelete(id);
  if (!bus) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Bus not found!");
=======
  )
  if (!bus)
    throw new ApiError(HttpStatus.NOT_FOUND, 'Bus not found!')
  await bus.populate('route')
  await bus.populate({ path: "driver", populate: { path: "user" } });
  return bus
}

const deleteBus = async (id) => {
  const bus = await Bus.findByIdAndDelete(id)
  if (!bus) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Bus not found!')
>>>>>>> 99c9ae0e7ad2a026bc14f99fc0978d6411cf701c
  }
  return bus;
};

module.exports = {
  getAllBus,
  createBus,
  getBusById,
  updateBus,
<<<<<<< HEAD
  deleteBus,
};
=======
  deleteBus
}

>>>>>>> 99c9ae0e7ad2a026bc14f99fc0978d6411cf701c
