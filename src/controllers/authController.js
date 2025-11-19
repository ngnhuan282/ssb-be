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

// === HÀM SINH USERNAME KHÔNG TRÙNG ===
const generateUniqueUsername = async (base) => {
  let username = base;
  let counter = 1;
  while (await User.findOne({ username })) {
    username = `${base}_${counter}`;
    counter++;
  }
  return username;
};

/**
 * @route   POST /auth/social-callback
 * @desc    Xử lý callback từ Auth0 → lưu user Google → trả JWT
 */
const socialCallback = async (req, res, next) => {
  try {
    console.log('Social callback received');
    const { idToken } = req.body;

    if (!idToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID token is required');
    }

    // === XÁC THỰC ID TOKEN ===
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        getKey,
        {
          audience: process.env.AUTH0_CLIENT_ID,
          issuer: `https://${process.env.AUTH0_DOMAIN}/`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        }
      );
    });

    const email = decoded.email?.toLowerCase();
    if (!email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email not found in Auth0 token');
    }

    // === ƯU TIÊN: nickname → name → email prefix ===
    let preferredName = decoded.nickname?.trim() ||
      decoded.name?.trim() ||
      email.split('@')[0];

    let baseUsername = preferredName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase() || 'user';

    // === TÌM USER THEO EMAIL ===
    let user = await User.findOne({ email });

    if (!user) {
      // === TẠO USER MỚI ===
      const finalUsername = await generateUniqueUsername(baseUsername);
      console.log('Creating new Google user:', email, '→ username:', finalUsername);

      user = new User({
        username: finalUsername,
        email,
        password: Math.random().toString(36).slice(-12),
        role: 'parent',
      });
      await user.save();
    } else {
      // === USER ĐÃ TỒN TẠI: CẬP NHẬT USERNAME NẾU LÀ FALLBACK CŨ ===
      const isFallback = user.username === email.split('@')[0];
      if (isFallback) {
        const finalUsername = await generateUniqueUsername(baseUsername);
        user.username = finalUsername;
        await user.save();
      }
    }

    // === TẠO JWT ===
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

    //driver id 
    let driverId = null;
    if (user.role === 'driver') {
      const driverProfile = await authService.getDriverProfileByUserId(user._id);

      if (!driverProfile) {
        // Lỗi nghiêm trọng: User có role 'driver' nhưng không có hồ sơ Driver
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Tài khoản tài xế bị lỗi, không tìm thấy hồ sơ.');
      }
      driverId = driverProfile._id.toString();
      console.log('✅ Driver login, found driverId:', driverId);
    }

    res.status(StatusCodes.OK).json(new ApiResponse(
      StatusCodes.OK,
      { user: userResponse, driverId }, // Chỉ trả thông tin cơ bản
      'Đăng nhập thành công!'
    ));
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