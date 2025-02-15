'use client';

import Spinner, { SpinnerColor } from '@/component/Spinner';
// import { clsx } from 'clsx/lite';
import { ButtonHTMLAttributes, ReactNode } from 'react';

export default function LoaderButton(props: {
  isLoading?: boolean
  icon?: ReactNode
  spinnerColor?: SpinnerColor
  styleAs?: 'button' | 'link' | 'link-without-hover'
  hideTextOnMobile?: boolean
  confirmText?: string
  shouldPreventDefault?: boolean
  primary?: boolean
  hideFocusOutline?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const {
    children,
    isLoading,
    icon,
    spinnerColor,
    styleAs = 'button',
    hideTextOnMobile = true,
    confirmText,
    shouldPreventDefault,
    primary,
    hideFocusOutline,
    type = 'button',
    onClick,
    disabled,
    className,
    ...rest
  } = props;

  return (
    <button
      {...rest}
      type={type}
      onClick={e => {
        if (shouldPreventDefault) { e.preventDefault(); }
        if (!confirmText || confirm(confirmText)) {
          onClick?.(e);
        }
      }}
      disabled={isLoading || disabled}
    >
      {(icon || isLoading) &&
        <span >
          {isLoading
            ? <Spinner
              size={14}
              color={spinnerColor}
              className="translate-y-[0.5px]"
            />
            : icon}
        </span>}
      {children && <span >
        {children}
      </span>}
    </button>
  );
}
