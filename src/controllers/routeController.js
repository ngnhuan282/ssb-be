const ApiResponse = require("../utils/apiResponse");
const HttpStatus = require('http-status-codes');
const routeService = require('../services/routeService')

const getAllRoutes = async (req, res, next) => {
  try {
    const route = await routeService.getAllRoutes();
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, route, "Get all routes succsessfully!"));
  } catch (error) {
    next(error)
  }
}

const getRouteById = async (req, res, next) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, route, 'Get route by id successfully!'));
  } catch (error) {
    next(error)
  }
}

const createRoute = async (req, res, next) => {
  try {
    const route = await routeService.createRoute(req.body);
    res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, route, 'Create Route successfully!'));
  } catch (error) {
    next(error);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const route = await routeService.updateRoute(req.params.id, req.body);
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, route, 'Route updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    await routeService.deleteRoute(req.params.id);
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, 'Route deleted successfully'));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
}