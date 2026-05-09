import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { registerUser } from "../api/authApi";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

function RegisterPage() {
  const navigate = useNavigate();

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      navigate("/login");
    } catch (err) {
      setError("root", { message: "Registration failed" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register
        </h2>

        {errors.root && (
          <p className="text-red-500 mb-4">
            {errors.root.message}
          </p>
        )}

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
            />
          )}
        />

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
          {isSubmitting ? "Registering..." : "Register"}
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