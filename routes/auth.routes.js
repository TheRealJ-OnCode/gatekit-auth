const { auth_login, auth_register, auth_refresh, auth_logout, auth_validate } = require("../controllers/auth.controllers");
const { authenticate } = require("../middleware/auth.middleware");

const authRoutes = require("express").Router();

authRoutes.post("/login", auth_login);
authRoutes.post("/register", auth_register);
authRoutes.post("/refresh", auth_refresh);
authRoutes.post("/logout", auth_logout);
authRoutes.get("/validate", authenticate, auth_validate);

module.exports = authRoutes