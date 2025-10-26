const User = require("../models/UserModel");
const ApiError = require("../utils/apiError");
const HttpStatus = require('http-status');
const bcrypt = require('bcrypt'); 

const getAllUsers = async () => {
    const users = await User.find();
    console.log('📝 Found users:', users.length); // ✅ Log số lượng
    console.log('🗄️ Collection:', User.collection.name); // ✅ Log collection name
    return users;
};

const getUserById = async (id) => {
    const user = await User.findById(id);
    if(!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

const createUser = async (userData) => {
    // const { password } = userData;

    // const hashedPassword = await bcrypt.hash(password, 10);
    // const user = new User({...userData, password: hashedPassword});
    const user = new User(userData);
    return await user.save();
};

const updateUser = async (id, updateData) => {
    // if(updateData.password) {
    //     updateData.password = await bcrypt.hash(updateData.password, 10);
    // }
    const user = await User.findByIdAndUpdate(
        id,
        {...updateData, updatedAt: Date.now()},
        {new: true, runValidators: true}
    ).select('-password');
    if(!user) {
        throw new ApiError(HttpStatus.NOT_FOUND, 'User not found');
    }
    return user;
}

const deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
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