const ApiResponse = require("../utils/apiResponse");
const HttpStatus = require('http-status');
const parentService = require("../services/parentService");

const getAllParents = async (req, res, next) => {
    try {
        const parent = parentService.getAllParents();
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, parent, 'Get all parents successfully!'));
    } catch (error) {
        next(error);
    }
};

const getParentById = async (req, res, next) => {
    try {
        const parent = parentService.getParentById(req.params.id);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK), parent, 'Get parent by id successfully!');
    } catch (error) {
        next(error);
    }
};

const createParent = async (req, res, next) => {
    try {
        const parent = parentService.createParent(req.body);
        res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, parent, 'Create parent successfully!'));
    } catch (error) {
        next(error);
    }
};

const updateParent = async (req, res, next) => {
    try {
        const parent = parentService.updateParent(req.params.id, req.body);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, parent, 'Parent updated successfully'));
    } catch (error) {
        next(error);
    }
};

const deleteParent = async (req, res, next) => {
    try {
        await parentService.deleteParent(req.params.id);
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, 'Parent deleted successfully'));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllParents,
    getParentById,
    createParent,
    updateParent,
    deleteParent,
}