const User = require("../models/UserModel");
const ApiError = require("../utils/apiError");
const HttpStatus = require('http-status');

const getAllUsers = async () => {
    return await User.find();
};

const getUserById = async (id) => {
    const user = await User.findById(id);
    if(!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const createUser = async (userData) => {
    const { password } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({...userData, password: hashedPassword});
    return await user.save();
};

const updateUser = async (id, updateData) => {
    if(updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password, 10);
    }
    const user = await User.findByIdAndUpdate(
        id,
        {...updateData, updatedAt: Date.now()},
        {new: true, runValidators: true}
    );
    if(!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }
    return user;
}

const deleteUser = async (id) => {
    const user = await User.findByIdAndUpdate(id);
    if(!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }
    return user;
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}