import { Controller } from "react-hook-form";
import type { Control, FieldValues, FieldPath } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: any;
  [key: string]: any;
}

function Select<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Select option",
  error,
  ...props
}: SelectProps<T>) {
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
          <select
            {...field}
            {...props}
            className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <p className="text-red-500 text-sm mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}

export default Select;
