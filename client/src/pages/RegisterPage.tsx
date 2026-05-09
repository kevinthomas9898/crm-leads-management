import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
        }
      );

      navigate("/login");
    } catch (err) {
      setError(
        "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register
        </h2>

        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          Register
        </button>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <span
            onClick={() =>
              navigate("/login")
            }
            className="text-blue-500 cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;