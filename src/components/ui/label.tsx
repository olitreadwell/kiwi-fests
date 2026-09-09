import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentProps } from 'react';

/**
 * Accessible form label backed by Radix UI.
 * Pairs with the Input/Textarea/Select primitives.
 *
 * @param props - Standard label props plus optional className
 * @returns Radix label with the shared field-label styling
 */
export function Label({ className = '', ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={`text-sm font-medium text-neutral-800 ${className}`}
      {...props}
    />
  );
}
