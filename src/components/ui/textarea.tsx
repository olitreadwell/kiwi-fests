/**
 * Styled native textarea. Same rationale as Input: native element, shared style.
 *
 * @param props - Native textarea props
 * @returns A styled textarea element
 */
export function Textarea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={`rounded border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 ${className}`}
      {...props}
    />
  );
}
import type { ComponentProps } from 'react';
