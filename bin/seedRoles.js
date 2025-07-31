module.exports = async function (args) {
  const path = require("path");
  const mongoose = require("mongoose");
  const fs = require("fs");
  require("dotenv").config();
  const Role = require("../models/Role");

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoURI);

  let configPath = args[0]?.startsWith("--config") ? args[1] : null;
  let config = [];

  if (configPath) {
    const fullPath = path.resolve(process.cwd(), configPath);
    if (configPath.endsWith(".json")) {
      config = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } else {
      config = require(fullPath);
    }
  } else {
    config = [
      { name: "admin", permissions: ["can-manage"] },
      { name: "user", permissions: [] }
    ];
  }

  for (const role of config) {
    const exists = await Role.findOne({ name: role.name });
    if (!exists) {
      await Role.create(role);
      console.log(`Created role: ${role.name}`);
    } else {
      console.log(`Role '${role.name}' already exists`);
    }
  }

  process.exit(0);
};
