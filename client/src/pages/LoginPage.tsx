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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 pt-24 pb-8 overflow-y-auto dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 my-auto">
                {/* Logo/Brand */}
                <div className="text-center lg:text-left lg:flex-1 lg:max-w-lg">
                    <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6 dark:text-white">CRM System</h1>
                    <p className="text-lg lg:text-xl text-gray-600 leading-relaxed dark:text-gray-400">Welcome back! Please login to continue</p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md lg:flex-shrink-0 dark:bg-gray-800 dark:border-gray-700"
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center dark:text-white">
                        Login to Your Account
                    </h2>

                    {errors.root && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
                            {errors.root.message}
                        </div>
                    )}

                    <div className="space-y-5">
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Email Address</label>
                                    <input
                                        {...field}
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    />
                                </div>
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Password</label>
                                    <input
                                        {...field}
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    />
                                </div>
                            )}
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </div>

                    <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/register")}
                            className="text-blue-600 font-medium cursor-pointer hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Register
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;