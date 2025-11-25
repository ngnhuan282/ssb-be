const ApiError = require("../utils/apiError");
const Location = require("../models/LocationModel");
const HttpStatus = require('http-status');

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

const deleteLocation = async (id) => {
    const location = Location.findByIdAndDelete(id);
    if (!location) { throw new ApiError(HttpStatus.NOT_FOUND, "Location not found") }
    return location;
}

const getLatestLocationByBus = async (busId) => {
    const location = await Location.findOne({ busId: busId })
        .sort({ timestamp: -1 }); // Sắp xếp để lấy timestamp mới nhất

    if (!location) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Không tìm thấy vị trí cho xe buýt này');
    }
    return location;
};

const updateLocationByBusId = async (busId, locationData) => {
    const location = await Location.findOneAndUpdate(
        { busId: busId },
        {
            ...locationData,
            timestamp: Date.now()
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );
    return location;
};

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    getLatestLocationByBus,
    updateLocationByBusId
}