const express = require("express");
const authRoutes = require("./routes/auth.routes");
const { initGatekit } = require("./init/initializer");
const getModels = require("./utils/getModels");
const authRouter = express.Router();
authRouter.use("/", authRoutes);

module.exports = {
    authRouter, initGatekit, getModels
}
