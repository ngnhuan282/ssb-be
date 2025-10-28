const { StatusCodes } = require('http-status-codes');
const ms = require('ms');
const JwtProvider = require("../providers/JwtProvider");
const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

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
    getCurrentUser
};