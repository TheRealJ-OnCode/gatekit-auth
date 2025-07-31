const Role = require("../models/Role");
const User = require("../models/User");

async function registerRole(name, permissions = []) {
  const existing = await Role.findOne({ name });
  if (existing) return existing;
  const newRole = await Role.create({ name, permissions });
  return newRole;
}

async function deleteRole(name) {
  try {
    const role = await Role.findOne({ name });
    if (!role) {
      throw new Error("Role not found");
    }
    
    await User.updateMany(
      { roles: role._id },
      { $pull: { roles: role._id } }
    );
    await Role.deleteOne({ name });
    return { success: true, message: "Role deleted successfully" };
  } catch (error) {
    throw error;
  }
}

async function assignRole(userId, roleName) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new Error("Role not found");
    }
    
    if (user.roles.includes(role._id)) {
      return { success: false, message: "User already has this role" };
    }
    user.roles.push(role._id);
    await user.save();
    return { success: true, message: "Role assigned successfully" };
  } catch (error) {
    throw error;
  }
}

async function removeRole(userId, roleName) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new Error("Role not found");
    }
    
    const roleIndex = user.roles.indexOf(role._id);
    if (roleIndex === -1) {
      return { success: false, message: "User does not have this role" };
    }
    user.roles.splice(roleIndex, 1);
    await user.save();
    return { success: true, message: "Role removed successfully" };
  } catch (error) {
    throw error;
  }
}

async function getUserRoles(userId) {
  try {
    const user = await User.findById(userId).populate('roles');
    if (!user) {
      throw new Error("User not found");
    }
    return user.roles;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerRole,
  deleteRole,
  assignRole,
  removeRole,
  getUserRoles
};