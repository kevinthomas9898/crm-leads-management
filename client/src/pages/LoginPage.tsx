import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { loginUser } from "../api/authApi";

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const handleLogin = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            const data =
                await loginUser({
                    email,
                    password,
                });

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            navigate("/");
        } catch (err) {
            setError(
                "Invalid credentials"
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Login
                </h2>

                {error && (
                    <p className="text-red-500 mb-4">
                        {error}
                    </p>
                )}

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
                    Login
                </button>
                <p className="text-center mt-4">
                    Don't have an account?{" "}
                    <span
                        onClick={() =>
                            navigate("/register")
                        }
                        className="text-blue-500 cursor-pointer"
                    >
                        Register
                    </span>
                </p>
            </form>
        </div>
    );
}

export default LoginPage;