/**
 * Centralized Permission Definitions
 * 
 * This file serves as the single source of truth for all permission strings
 * used throughout the application. All permission checks should reference these
 * constants rather than hardcoded strings.
 */

// Individual permission constants
const PERMISSIONS = {
  // Lead management permissions
  CREATE_LEAD: "create_lead",
  READ_LEAD: "read_lead",
  UPDATE_LEAD: "update_lead",
  DELETE_LEAD: "delete_lead",
  
  // User management permissions (granular)
  CREATE_USER: "create_user",
  READ_USER: "read_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",
  
  // Role management permissions (granular)
  CREATE_ROLE: "create_role",
  READ_ROLE: "read_role",
  UPDATE_ROLE: "update_role",
  DELETE_ROLE: "delete_role",
  
  // Super permissions (backward compatibility - grant all permissions in category)
  MANAGE_USERS: "manage_users", // Grants all user permissions
  MANAGE_ROLES: "manage_roles", // Grants all role permissions
};

// Array of all available permissions
const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Permission groups for easier management
const PERMISSION_GROUPS = {
  LEADS: [PERMISSIONS.CREATE_LEAD, PERMISSIONS.READ_LEAD, PERMISSIONS.UPDATE_LEAD, PERMISSIONS.DELETE_LEAD],
  USERS: [PERMISSIONS.CREATE_USER, PERMISSIONS.READ_USER, PERMISSIONS.UPDATE_USER, PERMISSIONS.DELETE_USER],
  ROLES: [PERMISSIONS.CREATE_ROLE, PERMISSIONS.READ_ROLE, PERMISSIONS.UPDATE_ROLE, PERMISSIONS.DELETE_ROLE],
};

/**
 * Validate if a permission string is valid
 * @param {string} permission - The permission to validate
 * @returns {boolean} - True if the permission is valid
 */
const isValidPermission = (permission) => {
  return ALL_PERMISSIONS.includes(permission);
};

/**
 * Validate if all permissions in an array are valid
 * @param {string[]} permissions - Array of permissions to validate
 * @returns {boolean} - True if all permissions are valid
 */
const areValidPermissions = (permissions) => {
  return permissions.every(isValidPermission);
};

/**
 * Expand super permissions to their granular equivalents
 * @param {string[]} permissions - Array of permissions (may include super permissions)
 * @returns {string[]} - Array with super permissions expanded to granular ones
 */
const expandPermissions = (permissions) => {
  const expanded = new Set(permissions);
  
  if (expanded.has(PERMISSIONS.MANAGE_USERS)) {
    PERMISSION_GROUPS.USERS.forEach(perm => expanded.add(perm));
  }
  
  if (expanded.has(PERMISSIONS.MANAGE_ROLES)) {
    PERMISSION_GROUPS.ROLES.forEach(perm => expanded.add(perm));
  }
  
  return Array.from(expanded);
};

module.exports = {
  PERMISSIONS,
  ALL_PERMISSIONS,
  PERMISSION_GROUPS,
  isValidPermission,
  areValidPermissions,
  expandPermissions,
};
