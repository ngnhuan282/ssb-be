const ApiResponse = require("../utils/apiResponse");
const HttpStatus = require("http-status");
const locationService = require("../services/locationService");

const getAllLocation = async (req, res, next) => {
  try {
    const locations = await locationService.getAllLocations();
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          HttpStatus.OK,
          locations,
          "Get all locations successfully!"
        )
      );
  } catch (error) {
    next(error);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const location = await locationService.getLocationById(req.params.id);
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          HttpStatus.OK,
          location,
          "Get location by id successfully!"
        )
      );
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    // SỬA LỖI 2: Thêm 'await'
    const location = await locationService.createLocation(req.body);
    // Thay đổi HttpStatus thành CREATED (201) để đúng chuẩn RESTful
    res
      .status(HttpStatus.CREATED)
      .json(
        new ApiResponse(
          HttpStatus.CREATED,
          location,
          "Create a location successfully!"
        )
      );
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    // SỬA LỖI 2: Thêm 'await'
    const location = await locationService.updateLocation(
      req.params.id,
      req.body
    );
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          HttpStatus.OK,
          location,
          "Update a location successfully!"
        )
      );
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    // SỬA LỖI 2: Thêm 'await'
    await locationService.deleteLocation(req.params.id);
    res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(HttpStatus.OK, null, "Delete a location successfully!")
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLocation,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
};
