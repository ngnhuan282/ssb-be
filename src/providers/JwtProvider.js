const JWT = require('jsonwebtoken');

const generateToken = async (userInfo, secretSignature, tokenLife) => {
    try {
        return JWT.sign(userInfo, secretSignature, {
            algorithm: 'HS256',
            expiresIn: tokenLife
        });
    } catch (error) {
        throw new Error("Token generation failed");
    }
};

const verifyToken = async (token, secretSignature) => {
    try {
        return JWT.verify(token, secretSignature);
    } catch (error) {
        console.log("Verify error: ", error.message);
        throw error;
    }
};

module.exports = {
    generateToken,
    verifyToken
};