import { StatusCodes } from "http-status-codes";
import { JwtProvider } from "../providers/JwtProvider";

// Middleware xác thực token từ Cookie
const isAuthorized = async (req, res, next) => {
    // Lấy accessToken từ Cookie
    const accessToken = req.cookies?.accessToken;
    if(!accessToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized ! Token not found"});
    }

    try {
        // Giải mã token
        const accessTokenDecoded = await JwtProvider.verifyToken(
            accessToken, 
            process.env.ACCESS_TOKEN_SECRET_SIGNATURE
        );

        // Lưu thông tin user vào request để dùng ở các controller
        req.jwtDecoded = accessTokenDecoded;

        // Cho phép request tiếp tục
        next();
    } catch (error) {
        // Token hết hạn -> cần refresh
        if(error.message.includes('jwt expired')) {
            return res.status(StatusCodes.GONE).json({ message: 'Need to refresh token'});
        }

        // Token không hợp lệ
        return res.status(StatusCodes.UNAUTHORIZED).json({message: 'Unauthorized ! Please login'});
    }
    
};

// Middleware kiểm tra role
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.jwtDecoded?.role;

        if(!allowedRoles.includes(userRole)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Access denied! Insufficient permission'
            })
        }

        next();
    };
};

export const authMiddleware = {
    isAuthorized,
    checkRole,
};