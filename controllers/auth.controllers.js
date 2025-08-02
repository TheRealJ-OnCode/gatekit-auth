const User = require("../models/User");
const ResponseHandler = require("../utils/ResponseHandler");
const { generateTokens, verifyRefreshToken, verifyAccessToken } = require("../services/token.service");
const { setRefreshToken, getRefreshToken, deleteRefreshToken, blacklistToken, deleteUserSessions } = require("../services/redis.service");
const { getCallback } = require("../core/callbacks.js");


const auth_register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return ResponseHandler.validationError(res, "Username, email, and password are required");
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return ResponseHandler.conflict(res, "This username or email is already in use");
        }

        const { metadata, ...restBody } = req.body;
        const newUser = new User({ username, email, password, metadata: metadata || {} });
        await newUser.save();

        const responseData = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt
        };

        const cb = getCallback("onRegister");
        if (cb) await cb(newUser, req, res);

        return ResponseHandler.success(res, "Registration successful", responseData, 201);
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

        const user = await User.findOne({ $or: [{ email: username }, { username }] });
        if (!user || user.isBanned) {
            return ResponseHandler.unauthorized(res, "Invalid username or password");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return ResponseHandler.unauthorized(res, "Invalid username or password");
        }

        const tokens = generateTokens(user._id.toString());
        await setRefreshToken(user._id.toString(), tokens.refreshToken);

        const responseData = {
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            tokens
        };

        const cb = getCallback("onLogin");
        if (cb) await cb(user, req, res);

        return ResponseHandler.success(res, "Login successful", responseData);
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
            return ResponseHandler.unauthorized(res, "Invalid or expired refresh token");
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

        const cb = getCallback("onRefresh");
        if (cb) await cb(user, req, res);

        return ResponseHandler.success(res, "Token refreshed successfully", tokens);
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

            const cb = getCallback("onLogout");
            if (cb) await cb(decoded.userId, req, res);

            return ResponseHandler.success(res, "Logout successful");
        } catch {
            return ResponseHandler.success(res, "Logout successful");
        }
    } catch (error) {
        console.error("Logout error:", error);
        return ResponseHandler.serverError(res, "An error occurred during logout");
    }
};

const auth_validate = (req, res) => {
    const user = req.user;

    const cb = getCallback("onValidate");
    if (cb) cb(user, req, res); 

    return ResponseHandler.success(res, "Token is valid", {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        metadata: user.metadata
    });
};

module.exports = {
    auth_login,
    auth_register,
    auth_refresh,
    auth_logout,
    auth_validate
};
