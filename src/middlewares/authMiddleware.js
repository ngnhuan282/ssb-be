const { StatusCodes } = require('http-status-codes');
const { generateToken, verifyToken } = require('../providers/JwtProvider');

const isAuthorized = async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized ! Token not found" });
    }

    try {
        const accessTokenDecoded = await verifyToken(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE
        );
        req.jwtDecoded = accessTokenDecoded;
        next();
    } catch (error) {
        if (error.message.includes('jwt expired')) {
            return res.status(StatusCodes.GONE).json({ message: 'Need to refresh token' });
        }
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized ! Please login' });
    }
};

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.jwtDecoded?.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Access denied! Insufficient permission'
            });
        }
        next();
    };
};

module.exports = {
    isAuthorized,
    checkRole,
};