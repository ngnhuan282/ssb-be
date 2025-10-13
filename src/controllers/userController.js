const ApiResponse = require("../utils/apiResponse");
const HttpStatus = require('http-status-codes');
const userService = require("../services/userService");

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res
      .status(HttpStatus.OK) // ✅ Dùng số trực tiếp
      .json(new ApiResponse(HttpStatus.OK, users, 'Get all users successfully'));
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id); // ✅ Đã sửa tên function
        res.status(200).json(new ApiResponse(200, user, 'Get user by id successfully'));
    } catch (error) {
        next(error);
    }
}

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(new ApiResponse(201, user, 'Create user successfully'));
    } catch (error) {
        next(error);
    }
}

const updateUser = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, user, 'Update user successfully'));
    } catch (error) {
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json(new ApiResponse(200, null, 'Delete user successfully'));
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