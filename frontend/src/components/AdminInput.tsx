'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface InputProps {
  label?: string;
  required?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'url';
  error?: string;
}

export default function AdminInput({
  label,
  required,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
}: InputProps) {
  const [show, setShow] = useState<boolean>(false);
  const inputType = type === 'password' ? (show ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-gray-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
            error
              ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
              : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
          } ${Icon ? 'pl-9' : ''} ${type === 'password' ? 'pr-9' : ''}`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            tabIndex={-1}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
