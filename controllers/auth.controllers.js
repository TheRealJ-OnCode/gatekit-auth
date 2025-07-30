const User = require("../models/User");
const ResponseHandler = require("../utils/ResponseHandler");

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

        const userData = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt
        };
        return ResponseHandler.success(res, "Registration successful", userData, 201);
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

        const userData = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        return ResponseHandler.success(res, "Login successful", userData);
    } catch (error) {
        console.error("Login error:", error);
        return ResponseHandler.serverError(res, "An error occurred during the login process");
    }
};

module.exports = {
    auth_login,
    auth_register
}
