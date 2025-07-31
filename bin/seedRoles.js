// /usr/bin/env node

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const Role = require("../models/Role");

// 1. Config path tespit et
let configPath;
const configArgIndex = args.indexOf("--config");
if (configArgIndex !== -1 && args[configArgIndex + 1]) {
  configPath = path.resolve(process.cwd(), args[configArgIndex + 1]);
} else {
  configPath = path.resolve(__dirname, "../migrations/roles.config.js");
}

(async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MONGODB_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(mongoURI);

  // Control Json or JS
  let config;
  if (configPath.endsWith(".json")) {
    try {
      const raw = fs.readFileSync(configPath, "utf-8");
      config = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse JSON:", err.message);
      process.exit(1);
    }
  } else {
    try {
      config = require(configPath);
    } catch (err) {
      console.error("Failed to load config module:", err.message);
      process.exit(1);
    }
  }

  // If file consists of function
  if (typeof config === "function") {
    await config(async (name, permissions = []) => {
      const exists = await Role.findOne({ name });
      if (!exists) {
        await Role.create({ name, permissions });
        console.log("Role created:", name);
      } else {
        console.log("Role exists:", name);
      }
    });
  }

  // If file consists of Array
  else if (Array.isArray(config)) {
    for (const role of config) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) {
        await Role.create(role);
        console.log("Role created:", role.name);
      } else {
        console.log("Role exists:", role.name);
      }
    }
  }

  // Invalid Fromat
  else {
    console.error("Invalid config format: Must export a function or array.");
    process.exit(1);
  }

  await mongoose.disconnect();
  console.log("Role seeding finished.");
})();
