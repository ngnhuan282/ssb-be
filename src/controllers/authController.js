const { StatusCodes } = require('http-status-codes');
const ms = require('ms');
const JwtProvider = require("../providers/JwtProvider");
const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const User = require('../models/UserModel');
const { auth } = require('express-oauth2-jwt-bearer');

// Middleware Auth0
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

/**
 * @route   POST /auth/social-callback
 * @desc    Xử lý callback từ Auth0 social login
 * @access  Protected by Auth0 JWT
 */
const socialCallback = async (req, res) => {
  try {
    console.log('🔐 Social callback received');
    
    // Auth0 user info đã được verify bởi checkJwt middleware
    const auth0User = req.auth;
    
    if (!auth0User || !auth0User.sub) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Auth0 token');
    }

    // Lấy email từ Auth0 claims
    const email = auth0User['https://your-api/email'] || auth0User.email;
    const auth0Id = auth0User.sub;
    const name = auth0User.name || auth0User.nickname;

    if (!email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email not found in Auth0 token');
    }

    console.log('📧 Processing social login for:', email);

    // Tìm hoặc tạo user trong database
    let user = await User.findOne({ $or: [{ email }, { auth0Id }] });
    
    if (!user) {
      console.log('👤 Creating new user from social login');
      user = new User({
        username: name?.replace(/\s+/g, '_').toLowerCase() || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-8), // Random password (không dùng)
        role: 'parent', // Default role
        auth0Id,
        isEmailVerified: true, // Social login đã verify email
      });
      await user.save();
    } else if (!user.auth0Id) {
      // Nếu user đã tồn tại nhưng chưa có auth0Id (đăng ký bằng email/password trước đó)
      user.auth0Id = auth0Id;
      user.isEmailVerified = true;
      await user.save();
    }

    console.log('✅ User found/created:', user._id);

    // Tạo JWT tokens cho session
    const payload = {
      id: user._id.toString(),
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

    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: ms('15m'),
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: ms('14d'),
      path: '/',
    });

    console.log('🍪 Cookies set successfully');

    // Response
    res.status(StatusCodes.OK).json({
      success: true,
      user: payload,
      message: 'Social login successful'
    });

  } catch (error) {
    console.error('❌ Social callback error:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Social login failed'
    });
  }
};


/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
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
      new ApiResponse(StatusCodes.CREATED, { user: { id: user._id, username, email, role } }, 'Đăng ký thành công')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email và password là bắt buộc!');
        }

        // Validate credentials
        const user = await authService.validateCredentials(email, password);

        // Tạo payload cho JWT
        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            username: user.username
        };

        // Generate tokens
        const accessToken = await JwtProvider.generateToken(
            tokenPayload,
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
            '15m'
        );

        const refreshToken = await JwtProvider.generateToken(
            tokenPayload,
            process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
            '14 days'
        );
        
        // Set httpOnly cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: ms('14 days'),
            path: '/',
        });

        console.log('✅ Cookies set successfully');

        // TRẢ VỀ THÔNG TIN CƠ BẢN NGAY TRONG LOGIN RESPONSE
        const userResponse = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            username: user.username
        };

        // Response
        res
            .status(StatusCodes.OK)
            .json(new ApiResponse(
                StatusCodes.OK, 
                { user: userResponse }, // Chỉ trả thông tin cơ bản
                'Đăng nhập thành công!'
            ));

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất
 * @access  Public
 */
const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res
            .status(StatusCodes.OK)
            .json(new ApiResponse(
                StatusCodes.OK,
                null,
                'Đăng xuất thành công!'
            ));
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Làm mới access token
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
    try {
        const refreshTokenFromCookie = req.cookies?.refreshToken;

        if (!refreshTokenFromCookie) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token not found');
        }

        // Verify refresh token
        const decoded = await JwtProvider.verifyToken(
            refreshTokenFromCookie,
            process.env.REFRESH_TOKEN_SECRET_SIGNATURE
        );

        // Tạo payload mới
        const tokenPayload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            username: decoded.username
        };

        // Generate access token mới
        const newAccessToken = await JwtProvider.generateToken(
            tokenPayload,
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
            '15m'
        );

        // Set cookie mới
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: ms('15m'),
            path: '/',
        });

        res
            .status(StatusCodes.OK)
            .json(new ApiResponse(
                StatusCodes.OK,
                null,
                'Token refreshed successfully'
            ));

    } catch (error) {
        next(error);
    }
};

// GIỮ LẠI /me ENDPOINT (optional - nếu sau này cần dùng)
const getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id;
        const fullUserInfo = await authService.getFullUserInfo(userId);

        res
            .status(StatusCodes.OK)
            .json(new ApiResponse(
                StatusCodes.OK,
                fullUserInfo,
                'Get current user successfully'
            ));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    logout,
    refreshToken,
    getCurrentUser,
    register,
    checkJwt,
    socialCallback
};