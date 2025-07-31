const User = require("../models/User");
const ResponseHandler = require("../utils/ResponseHandler");
const { generateTokens, verifyRefreshToken, verifyAccessToken } = require("../services/token.service");
const { setRefreshToken, getRefreshToken, deleteRefreshToken, blacklistToken, deleteUserSessions } = require("../services/redis.service");

const auth_register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return ResponseHandler.validationError(res, "Username, email, and password are required");
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return ResponseHandler.conflict(res, "This username or email is already in use");
        }
        const { metadata, ...restBody } = req.body;
        
        const newUser = new User({
            username,
            email,
            password,
            metadata: metadata || {}
        });

        await newUser.save();

        return ResponseHandler.success(res, "Registration successful", {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt
        }, 201);
    } catch (error) {
        console.error("Register error:", error);
        return ResponseHandler.serverError(res, "An error occurred during the registration process");
    }
};

const auth_login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return ResponseHandler.validationError(res, "Username and password are required");
        }
        const user = await User.findOne({
            $or: [{ email: username }, { username: username }]
        });

        if (!user) {
            return ResponseHandler.unauthorized(res, "Invalid username or password");
        }

        if (user.isBanned) {
            return ResponseHandler.forbidden(res, "Your account has been banned");
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return ResponseHandler.unauthorized(res, "Invalid username or password");
        }

        const tokens = generateTokens(user._id.toString());
        await setRefreshToken(user._id.toString(), tokens.refreshToken);

        return ResponseHandler.success(res, "Login successful", {
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return ResponseHandler.serverError(res, "An error occurred during the login process");
    }
};

const auth_refresh = async (req, res) => {
    try {
        if (!req.body) {
            return ResponseHandler.badRequest(res, "Request body is missing");
        }

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return ResponseHandler.validationError(res, "Refresh token is required");
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            console.error("Token verification error:", error);
            if (error.name === "JsonWebTokenError") {
                return ResponseHandler.unauthorized(res, "Invalid refresh token format");
            }
            if (error.name === "TokenExpiredError") {
                return ResponseHandler.unauthorized(res, "Refresh token has expired");
            }
            return ResponseHandler.unauthorized(res, "Invalid refresh token");
        }

        const storedToken = await getRefreshToken(decoded.userId);

        if (!storedToken || storedToken !== refreshToken) {
            return ResponseHandler.unauthorized(res, "Invalid refresh token");
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return ResponseHandler.unauthorized(res, "User not found");
        }

        if (user.isBanned) {
            await deleteUserSessions(user._id.toString());
            return ResponseHandler.forbidden(res, "Your account has been banned");
        }

        const tokens = generateTokens(user._id.toString());
        await setRefreshToken(user._id.toString(), tokens.refreshToken);

        return ResponseHandler.success(res, "Token refreshed successfully", {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        return ResponseHandler.serverError(res, "An error occurred during token refresh", error.message);
    }
};

const auth_logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const refreshToken = req.body.refreshToken;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return ResponseHandler.validationError(res, "Access token is required");
        }

        const accessToken = authHeader.split(" ")[1];
        
        try {
            const decoded = verifyAccessToken(accessToken);
            
            if (refreshToken) {
                await deleteRefreshToken(decoded.userId);
            }
            
            await blacklistToken(accessToken);
            
            return ResponseHandler.success(res, "Logout successful");
        } catch (error) {
            return ResponseHandler.success(res, "Logout successful");
        }
    } catch (error) {
        console.error("Logout error:", error);
        return ResponseHandler.serverError(res, "An error occurred during logout");
    }
};

const auth_validate = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return ResponseHandler.unauthorized(res, "No token provided");
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        const user = await User.findById(decoded.userId).select("-password").populate("roles");
        
        if (!user) {
            return ResponseHandler.unauthorized(res, "User not found");
        }

        if (user.isBanned) {
            return ResponseHandler.forbidden(res, "Your account has been banned");
        }

        return ResponseHandler.success(res, "Token is valid", {
            id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            metadata: user.metadata
        });
    } catch (error) {
        console.error("Validate error:", error);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return ResponseHandler.unauthorized(res, "Invalid or expired token");
        }
        return ResponseHandler.serverError(res, "An error occurred during validation");
    }
};

module.exports = {
    auth_login,
    auth_register,
    auth_refresh,
    auth_logout,
    auth_validate
}
