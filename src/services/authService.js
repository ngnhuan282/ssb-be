import User from "../models/UserModel";
import Driver from "../models/DriverModel";
import Parent from "../models/ParentModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import { StatusCodes } from "http-status-codes";

/**
 * Tìm user theo email (bao gồm password để login
 */
const findUserByEmail = async (email) => {
    const user = await User.findOne({email});
    return user;
};

const getFullUserInfo = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password');
        if(!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
        }
        let additionalInfo = null;
        switch (user.role) {
            case 'driver':
                additionalInfo = await Driver.findOne({user: userId})
                .populate('assignedBus')
                .lean();
                break;
            case 'parent':
                additionalInfo = await Parent.findOne({user: userId})
                .populate('children')
                .lean();
            case 'admin':
                break;
            default:
                break;
        }
        return {...user.toObject(), additionalInfo};
    } catch (error) {
        throw error;
    }
};

/**
 * Validate login credentials
 */
const validateCredentials = async (email, password) => {
    // Tìm user
    const user = await findUserByEmail(email);

    if(!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!');
    }

    // So sánh password
    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không chính xác!');
    }
    return user;
}

module.exports = {
    validateCredentials,
    getFullUserInfo,
    findUserByEmail,
}