// src/controllers/authController.js
const { StatusCodes } = require('http-status-codes');
const JwtProvider = require('../providers/JwtProvider');
const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const User = require('../models/UserModel');

// ---- AUTH0 ID TOKEN VERIFICATION ----
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

/**
 * @route   POST /auth/social-callback
 * @desc    Xử lý callback từ Auth0 (ID Token) → tạo/đồng bộ user → trả JWT
 */
const socialCallback = async (req, res, next) => {
  try {
    console.log('Social callback received');
    const { idToken } = req.body;

    if (!idToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID token is required');
    }

    // Verify ID Token với Auth0
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        getKey,
        {
          audience: process.env.AUTH0_CLIENT_ID,     // ID Token audience = FE Client ID
          issuer: `https://${process.env.AUTH0_DOMAIN}/`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        }
      );
    });

    const email = decoded.email;
    const auth0Id = decoded.sub;
    const name = decoded.name || decoded.nickname || email.split('@')[0];

    if (!email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email not found in Auth0 token');
    }

    // Tìm hoặc tạo user
    let user = await User.findOne({ $or: [{ email }, { auth0Id }] });

    if (!user) {
      console.log('Creating new user from social login:', email);
      user = new User({
        username: name.replace(/\s+/g, '_').toLowerCase(),
        email,
        password: Math.random().toString(36).slice(-12), // random password
        role: 'parent',
        auth0Id,
        isEmailVerified: true,
      });
      await user.save();
    } else if (!user.auth0Id) {
      // Đồng bộ auth0Id nếu user đã tồn tại (email trùng)
      user.auth0Id = auth0Id;
      user.isEmailVerified = true;
      await user.save();
    }

    // Tạo JWT (giống login thường)
    const payload = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const accessToken = await JwtProvider.generateToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
      '15m'
    );

    const refreshToken = await JwtProvider.generateToken(
      payload,
      process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
      '14d'
    );

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
        user: payload,
        accessToken,
        refreshToken,
      }, 'Social login successful')
    );
  } catch (error) {
    console.error('Social callback error:', error);
    next(error);
  }
};

/**
 * @route   POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, role = 'parent' } = req.body;

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      throw new ApiError(StatusCodes.CONFLICT, 'Tên tài khoản hoặc email đã tồn tại');
    }

    const user = new User({ username, email, password, role });
    await user.save();

    res.status(StatusCodes.CREATED).json(
      new ApiResponse(StatusCodes.CREATED, {
        user: { _id: user._id, username, email, role }
      }, 'Đăng ký thành công')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email và password là bắt buộc!');
    }

    const user = await authService.validateCredentials(email, password);

    const tokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const accessToken = await JwtProvider.generateToken(
      tokenPayload,
      process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
      '15m'
    );

    const refreshToken = await JwtProvider.generateToken(
      tokenPayload,
      process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
      '14d'
    );

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
    };

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
        user: userResponse,
        accessToken,
        refreshToken,
      }, 'Đăng nhập thành công!')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /auth/logout
 */
const logout = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, null, 'Đăng xuất thành công!')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;

    if (!oldRefreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token required');
    }

    const decoded = await JwtProvider.verifyToken(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_SIGNATURE
    );

    const tokenPayload = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
      username: decoded.username,
    };

    const newAccessToken = await JwtProvider.generateToken(
      tokenPayload,
      process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
      '15m'
    );

    const newRefreshToken = await JwtProvider.generateToken(
      tokenPayload,
      process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
      '14d'
    );

    res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }, 'Token refreshed')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  register,
  socialCallback,
};