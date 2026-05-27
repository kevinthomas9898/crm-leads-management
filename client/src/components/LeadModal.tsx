import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Lead } from "../types/lead";
import TextInput from "./TextInput";
import Select from "./Select";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSubmit: (data: {
    name: string;
    email: string;
    company: string;
    status: string;
    owner: string;
  }) => void;
}

const LeadModal = ({ isOpen, onClose, lead, onSubmit }: LeadModalProps) => {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<{
    name: string;
    email: string;
    company: string;
    status: string;
    owner: string;
  }>({
    defaultValues: {
      name: "",
      email: "",
      company: "",
      status: "New",
      owner: "",
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        email: lead.email,
        company: lead.company,
        status: lead.status,
        owner: lead.owner,
      });
    } else {
      reset({
        name: "",
        email: "",
        company: "",
        status: "New",
        owner: "",
      });
    }
  }, [lead, isOpen, reset]);

  const onFormSubmit = (data: {
    name: string;
    email: string;
    company: string;
    status: string;
    owner: string;
  }) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 dark:bg-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {lead ? "Edit Lead" : "Add New Lead"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
          <TextInput
            name="name"
            control={control}
            label="Name *"
            type="text"
            placeholder="Enter lead name"
            error={errors.name}
          />

          <TextInput
            name="email"
            control={control}
            label="Email *"
            type="email"
            placeholder="Enter email address"
            error={errors.email}
          />

          <TextInput
            name="company"
            control={control}
            label="Company *"
            type="text"
            placeholder="Enter company name"
            error={errors.company}
          />

          <Select
            name="status"
            control={control}
            label="Status"
            options={[
              { value: "New", label: "New" },
              { value: "Contacted", label: "Contacted" },
              { value: "Qualified", label: "Qualified" },
              { value: "Lost", label: "Lost" },
            ]}
          />

          <Select
            name="owner"
            control={control}
            label="Owner *"
            options={[
              { value: "Kevin", label: "Kevin" },
              { value: "John", label: "John" },
              { value: "Sarah", label: "Sarah" },
              { value: "Mike", label: "Mike" },
            ]}
            placeholder="Select owner"
            error={errors.owner}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              {lead ? "Update Lead" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
