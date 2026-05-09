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
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold"
        >
          CRM System
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
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
        <div className="md:hidden px-4 py-4 flex flex-col gap-3 bg-white border-t">
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg w-full"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={handleMenuClose}
                className="bg-black text-white px-4 py-2 rounded-lg text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={handleMenuClose}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-center hover:bg-gray-300"
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