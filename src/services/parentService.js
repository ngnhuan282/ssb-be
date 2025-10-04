const ApiError = require("../utils/apiError");
const Parent = require("../models/ParentModel");
const HttpStatus = require('http-status');

const getAllParents = async () => {
    return await Parent.find();
};

const getParentById = async (id) => {
    const parent = await Parent.findById(id).populate('user children');
    if(!parent) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Parent not found');
    }
    return parent;
};

const createParent = async (parentData) => {
    const parent = new Parent(parentData);
    return await parent.save();
};

const updateParent = async (id, updateData) => {
    const parent = await Parent.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now()},
        {new: true, runValidators: true}
    );
    if(!parent) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Parent not found');
    }
    return parent;
};

const deleteParent = async (id) => {
    const parent = Parent.findByIdAndDelete(id);
    if(!parent) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'Parent not found');
    }
    return parent;
}

module.exports = {
    getAllParents,
    getParentById,
    createParent,
    updateParent,
    deleteParent,
};