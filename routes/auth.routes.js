const { auth_login, auth_register } = require("../controllers/auth.controllers");

const authRoutes = require("express").Router();

authRoutes.post("/login",auth_login);
authRoutes.post("/register",auth_register);

module.exports = authRoutes