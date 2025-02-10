'use client';

import { Ref } from 'react';
import { useFormStatus } from 'react-dom';
import Spinner from './Spinner';
// import { clsx } from 'clsx/lite';
import { FieldSetType, AnnotatedTag } from '@/photo/form';
import TagInput from './TagInput';
import { FiChevronDown } from 'react-icons/fi';

export default function FieldSetWithStatus({
  id,
  label,
  note,
  error,
  value,
  isModified,
  onChange,
  selectOptions,
  selectOptionsDefaultLabel,
  tagOptions,
  placeholder,
  loading,
  required,
  readOnly,
  capitalize,
  type = 'text',
  inputRef,
  accessory,
  hideLabel,
}: {
  id: string
  label?: string
  note?: string
  error?: string
  value: string
  isModified?: boolean
  onChange?: (value: string) => void
  selectOptions?: { value: string, label: string }[]
  selectOptionsDefaultLabel?: string
  tagOptions?: AnnotatedTag[]
  placeholder?: string
  loading?: boolean
  required?: boolean
  readOnly?: boolean
  capitalize?: boolean
  type?: FieldSetType
  inputRef?: Ref<HTMLInputElement>
  accessory?: React.ReactNode
  hideLabel?: boolean
}) {
  const { pending } = useFormStatus();

  return (
    <div >
      {!hideLabel && label &&
        <label          htmlFor={id}
        >
          {label}
          {note && !error &&
            <span className="text-gray-400 dark:text-gray-600">
              ({note})
            </span>}
          {isModified && !error &&
            <span >
              *
            </span>}
          {error &&
            <span className="text-error">
              {error}
            </span>}
          {required &&
            <span className="text-gray-400 dark:text-gray-600">
              Required
            </span>}
          {loading &&
            <span className="translate-y-[1.5px]">
              <Spinner />
            </span>}
        </label>}
      <div className="flex gap-2">
        { <input
                ref={inputRef}
                id={id}
                name={id}
                value={value}
                checked={type === 'checkbox' ? value === 'true' : undefined}
                placeholder={placeholder}
                onChange={e => onChange?.(type === 'checkbox'
                  ? e.target.value === 'true' ? 'false' : 'true'
                  : e.target.value)}
                type={type}
                autoComplete="off"
                autoCapitalize={!capitalize ? 'off' : undefined}
                readOnly={readOnly || pending || loading}
                disabled={type === 'checkbox' && (
                  readOnly || pending || loading
                )}

              />}
        {accessory && <div>
          {accessory}
        </div>}
      </div>
    </div>
  );
};
