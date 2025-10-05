const ApiError = require("../utils/apiError");
const Location = require("../models/LocationModel");
const HttpStatus = require('http-status');
const Location = require("../models/LocationModel");

const getAllLocations = async () => {
    return await Location.find();
}

const getLocationById = async (id) => {
    const Location = await Location.findById(id).populate('Bus Schedule');
    if (!location) throw new ApiError(HttpStatus.NOT_FOUND, 'Location not found')
    return location;
}

const createLocation = async (locationData) => {
    const location = new Location(locationData)
    return await location.save();
}

const updateLocation = async (id, updateData) => {
    const location = await Location.findByIdAndUpdate(
        id,
        {
            ...updateData,
            updateAt: Date.now()
        },
        {
            new: true,
            runValidators: true
        }
    );
    if (!location) { throw new ApiError(HttpStatus.NOT_FOUND, "Location not found") }
    return location;
}

const deleteSchedule = async (id) => {
    const location = Location.findByIdAndDelete(id);
    if (!location) { throw new ApiError(HttpStatus.NOT_FOUND, "Location not found") }
    return location;
}

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteSchedule
}