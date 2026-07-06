'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function FormSelect({
  name,
  value,
  onValueChange,
  options,
  placeholder,
  required,
  className,
}: FormSelectProps) {
  return (
    <>
      <input type="hidden" name={name} value={value} required={required} />
      <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
        <SelectTrigger className={className ?? 'w-full'}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
