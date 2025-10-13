const ApiResponse = require("../utils/apiResponse");
const HttpStatus = require('http-status');
const userService = require("../services/userService");

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res
      .status(HttpStatus.OK)
      .json(new ApiResponse(HttpStatus.OK, users, 'Get all users successfully'));
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, user, 'Get user by id successfully'));
    } catch (error) {
        next(error);
    }
}

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, user, 'Create user successfully'));
    } catch (error) {
        next(error);
    }
}

const updateUser = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, user, 'Update user successfully'));
    } catch (error) {
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, 'Delete user successfully'));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}