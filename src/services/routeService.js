const ApiError = require("../utils/apiError");
const Route = require("../models/RouteModel");
const HttpStatus = require('http-status');

const getAllRoutes = async () => {
    return await Route.find().populate('assignedBus');
}

const getRouteById = async (id) => {
    const route = await Route.findById(id).populate('assignedBus');
    if (!route) throw new ApiError(HttpStatus.NOT_FOUND, 'Route not found');
    return route;
}

const createRoute = async (routeData) => {
    const route = new Route(routeData);
    const saved = await route.save();
    await saved.populate('assignedBus');
    return saved;
}

const updateRoute = async (id, updateData) => {
    const route = await Route.findByIdAndUpdate(
        id,
        {
            ...updateData,
            updatedAt: Date.now()
        },
        {
            new: true,
            runValidators: true
        }
    );
    if (!route) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Route not found')
    }
    await route.populate('assignedBus');
    return route;
}

const deleteRoute = async (id) => {
    const route = await Route.findByIdAndDelete(id);
    if (!route) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Route not found');
    }
    return route;
}

module.exports = {
    getAllRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute
};