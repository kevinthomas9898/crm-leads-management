import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { Menu, X } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();

  const [open, setOpen] =
    useState(false);

  const token =
    localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpen(false);
    navigate("/login");
  };

  const handleMenuClose = () => {
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
        >
          CRM System
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden"
          onClick={() =>
            setOpen(!open)
          }
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
        <div className="md:hidden px-4 py-4 flex flex-col gap-3 bg-white border-t border-gray-100 shadow-lg">
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-lg font-medium transition-all duration-200 shadow-md"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={handleMenuClose}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-lg font-medium text-center transition-all duration-200 shadow-md"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={handleMenuClose}
                className="bg-white border border-gray-300 text-gray-700 px-5 py-3 rounded-lg font-medium text-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;