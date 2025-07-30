const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ResponseHandler = require("../utils/ResponseHandler");
const generateToken=(userId)=>{
    return jwt.sign(
        {userId},process.env.JWT_SECRET || "gatekit-secret-key",{expiresIn: process.env.JWT_EXPIRE || "7d"}
    )
}

const auth_register=async(req, res)=>{
    try {
        const {username, email, password}=req.body;
        if (!username || !email || !password) {
            return ResponseHandler.validationError(res,"Username,email ve password gerekli");
        }

        const existingUser = await User.findOne({
            $or: [{email},{username}]
        });

        if (existingUser) {
            return ResponseHandler.conflict(res,"Bu kullanıcı adı veya email zaten kullanımda");
        }

        const { metadata, ...restBody } = req.body;
        
        const newUser=new User({
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
        return ResponseHandler.success(res, "Kayıt başarılı", userData, 201);
    } catch (error){
        console.error("Register error:", error);
        return ResponseHandler.serverError(res, "Kayıt işlemi sırasında bir hata oluştu");
    }
};

const auth_login = async (req, res) => {
    try {
        const {username, password} = req.body;

        if (!username || !password) {
            return ResponseHandler.validationError(res, "Username ve password gerekli");
        }

        const user = await User.findOne({
            $or: [{ email: username }, { username: username }]
        });

        if (!user) {
            return ResponseHandler.unauthorized(res, "Kullanıcı adı veya şifre hatalı");
        }

        if (user.isBanned) {
            return ResponseHandler.forbidden(res, "Hesabınız engellenmiş");
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return ResponseHandler.unauthorized(res, "Kullanıcı adı veya şifre hatalı");
        }

        const token=generateToken(user._id);

        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            token
        };

        return ResponseHandler.success(res, "Giriş başarılı", userData);
    } catch (error) {
        console.error("Login error:", error);
        return ResponseHandler.serverError(res, "Giriş işlemi sırasında bir hata oluştu");
    }
};

module.exports = {
    auth_login,
    auth_register
}