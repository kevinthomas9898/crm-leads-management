import { useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";

function Navbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  const token = localStorage.getItem("token");

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const hasPermission = (permission: string) => {
    if (!user || !user.role) return false;

    const permissions =
      typeof user.role === "object"
        ? user.role.permissions || []
        : [];

    return permissions.includes(permission);
  };

  const canManageUsers = hasPermission("manage_users");
  const canManageRoles = hasPermission("manage_roles");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpen(false);
    setProfileOpen(!profileOpen);
    navigate("/login");
  };

  const handleMenuClose = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 items-center justify-between px-8">
        {/* Left Side */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent"
          >
            CRM
          </Link>
        </div>
        {token && (
          <div className="hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={navLinkClass}
            >
              Leads
            </NavLink>

            {canManageUsers && (
              <NavLink
                to="/users"
                className={navLinkClass}
              >
                Users
              </NavLink>
            )}

            {canManageRoles && (
              <NavLink
                to="/roles"
                className={navLinkClass}
              >
                Roles
              </NavLink>
            )}
          </div>
        )}

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>

          {token ? (
            <div className="relative">
              <button
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-1 transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-semibold text-white text-xs">
                  {(user?.name || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="text-left">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {user?.name || "User"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {typeof user?.role === "object"
                      ? user.role.name
                      : user?.role || "User"}
                  </p>
                </div>

                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {typeof user?.role === "object"
                        ? user.role.name
                        : user?.role}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition-all hover:bg-blue-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <div className="flex flex-col gap-2">
            {token && (
              <>
                <NavLink
                  to="/"
                  end
                  onClick={handleMenuClose}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 font-medium transition-all ${isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  Leads
                </NavLink>

                {canManageUsers && (
                  <NavLink
                    to="/users"
                    onClick={handleMenuClose}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 font-medium transition-all ${isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    Users
                  </NavLink>
                )}

                {canManageRoles && (
                  <NavLink
                    to="/roles"
                    onClick={handleMenuClose}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 font-medium transition-all ${isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    Roles
                  </NavLink>
                )}

                <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                      {(user?.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.name || "User"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {typeof user?.role === "object"
                          ? user.role.name
                          : user?.role || "User"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={toggleTheme}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-gray-300 p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {theme === "light" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}

              <span>
                {theme === "light"
                  ? "Dark Mode"
                  : "Light Mode"}
              </span>
            </button>

            {token ? (
              <button
                onClick={handleLogout}
                className="mt-2 rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition-all hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={handleMenuClose}
                  className="mt-2 rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white transition-all hover:bg-blue-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={handleMenuClose}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-center font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;