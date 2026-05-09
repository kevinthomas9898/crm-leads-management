import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { loginUser } from "../api/authApi";

interface LoginFormData {
    email: string;
    password: string;
}

function LoginPage() {
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await loginUser(data);
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            navigate("/");
        } catch (err) {
            setError("root", { message: "Invalid credentials" });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Login
                </h2>

                {errors.root && (
                    <p className="text-red-500 mb-4">
                        {errors.root.message}
                    </p>
                )}

                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="email"
                            placeholder="Email"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                        />
                    )}
                />

                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="password"
                            placeholder="Password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6"
                        />
                    )}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Logging in..." : "Login"}
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