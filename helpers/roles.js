const Role = require("../models/Role");
const User = require("../models/User");

async function registerRole(name, permissions = []) {
  const existing = await Role.findOne({ name });
  if (existing) return existing;
  const newRole = await Role.create({ name, permissions });
  return newRole;
}
async function deleteRole(name) {}
async function assignRole(userId, roleName) {}
async function removeRole(userId, roleName) {}
async function getUserRoles(userId) {}
module.exports = {
  registerRole,
  deleteRole,
  assignRole,
  removeRole,
  getUserRoles
};