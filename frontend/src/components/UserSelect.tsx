'use client';

import { ChevronDown } from 'lucide-react';

interface SelectProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  error?: string;
}

export default function UserSelect({
  label,
  required,
  value,
  onChange,
  options,
  error,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-zinc-400">
          {label} {required && <span className="text-gray-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange(e.target.value)
          }
          className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 dark:bg-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 transition appearance-none pr-8 ${
            error
              ? 'border-red-300 dark:border-red-900 focus:ring-red-100 dark:focus:ring-red-900/20 focus:border-red-400'
              : 'border-gray-200 dark:border-zinc-800 focus:ring-blue-200 dark:focus:ring-blue-900/20 focus:border-blue-400 dark:focus:border-blue-500'
          }`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="dark:bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
