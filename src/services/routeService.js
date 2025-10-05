const ApiError = require("../utils/apiError");
const Route = require("../models/RouteModel");
const HttpStatus = require('http-status');

const getAllRoutes = async () => {
    return await Route.find();
}

const getRouteById = async (id) => {
    const route = await Route.findById(id).populate('Bus');
    if (!route) throw new ApiError(HttpStatus.NOT_FOUND, 'Route not found');
    return route;
}

const createRoute = async (routeData) => {
    const route = new Route(routeData);
    return await route.save();
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
    return route;
}

const deleteRoute = async (id) => {
    const route = Route.findByIdAndDelete(id);
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