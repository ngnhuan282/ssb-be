const ApiError = require("../utils/apiError");
const Location = require("../models/LocationModel");
const HttpStatus = require("http-status");

const getAllLocations = async () => {
  return await Location.find();
};

const getLocationById = async (id) => {
  const location = await Location.findById(id).populate("busId scheduleId");
  if (!location) throw new ApiError(HttpStatus.NOT_FOUND, "Location not found");
  return location;
};

const createLocation = async (locationData) => {
  const location = new Location(locationData);
  return await location.save();
};

const updateLocation = async (id, updateData) => {
  const location = await Location.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!location) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Location not found");
  }
  return location;
};

const deleteLocation = async (id) => {
  const location = await Location.findByIdAndDelete(id);
  if (!location) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Location not found");
  }
  return location;
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
};
