import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, FieldPath } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface TextInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  error?: any;
  [key: string]: any;
}

function TextInput<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  placeholder = "",
  error,
  ...props
}: TextInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              {label}
            </label>
          )}
          <div className="relative">
            <input
              {...field}
              {...props}
              type={inputType}
              placeholder={placeholder}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                error
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } ${isPassword ? "pr-12" : ""}`}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}

export default TextInput;
