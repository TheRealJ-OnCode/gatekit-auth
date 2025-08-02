const express = require("express");
const authRoutes = require("./routes/auth.routes");
const { initGatekit } = require("./init/initializer");
const getModels = require("./utils/getModels");
const { authenticate, requirePermission, requireRole, optionalAuth } = require("./middleware/auth.middleware");
const { registerRole, deleteRole, assignRole, removeRole, getUserRoles } = require("./helpers/roles");
const { registerCallback } = require("./core/callbacks")
const authRouter = express.Router();
authRouter.use("/", authRoutes);

const middleware = {
    authenticate,
    requirePermission,
    requireRole,
    optionalAuth
};

const roleHelpers = {
    registerRole,
    deleteRole,
    assignRole,
    removeRole,
    getUserRoles
};

module.exports = {
    authRouter,
    initGatekit,
    getModels,
    middleware,
    roleHelpers,
    registerCallback
}
