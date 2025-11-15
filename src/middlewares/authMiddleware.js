// middlewares/authMiddleware.js
const { StatusCodes } = require('http-status-codes');
const { verifyToken } = require('../providers/JwtProvider');

const isAuthorized = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ 
      message: "Unauthorized! Token not found" 
    });
  }

  try {
    const decoded = await verifyToken(token, process.env.ACCESS_TOKEN_SECRET_SIGNATURE);
    req.jwtDecoded = decoded;
    next();
  } catch (error) {
    if (error.message.includes('jwt expired')) {
      return res.status(StatusCodes.GONE).json({ message: 'Token expired' });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
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

module.exports = { isAuthorized, checkRole };