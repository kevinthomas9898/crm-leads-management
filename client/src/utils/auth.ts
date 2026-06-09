import { toast } from "react-toastify";
import { expandPermissions } from "../constants/permissions";
import type { Permission } from "../constants/permissions";

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  toast.error("Session expired. Please login again.");
  
  setTimeout(() => {
    window.location.href = "/login";
  }, 3500);
};

/**
 * Check if user has a specific permission
 * @param permission - The permission to check
 * @param user - The user object with role
 * @returns True if user has the permission
 */
export const hasPermission = (permission: string, user: any): boolean => {
  if (!user || !user.role) return false;

  const permissions = typeof user.role === "object" 
    ? user.role.permissions || [] 
    : [];
  
  // Expand permissions to handle super permissions (e.g., manage_users -> create_user, read_user, etc.)
  const expandedPermissions = expandPermissions(permissions as Permission[]);
  
  return expandedPermissions.includes(permission as Permission);
};

/**
 * Check if user has any of the specified permissions
 * @param permissions - Array of permissions to check
 * @param user - The user object with role
 * @returns True if user has at least one of the permissions
 */
export const hasAnyPermission = (permissions: string[], user: any): boolean => {
  return permissions.some(perm => hasPermission(perm, user));
};

/**
 * Check if user has all of the specified permissions
 * @param permissions - Array of permissions to check
 * @param user - The user object with role
 * @returns True if user has all of the permissions
 */
export const hasAllPermissions = (permissions: string[], user: any): boolean => {
  return permissions.every(perm => hasPermission(perm, user));
};
