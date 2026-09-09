import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';

/** Accessible accordion built on Radix. See Radix docs for usage. */
export const Accordion = AccordionPrimitive.Root;

/** One collapsible section. */
export const AccordionItem = AccordionPrimitive.Item;

/** The clickable header for a section. */
export function AccordionTrigger({
  className = '',
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={`flex flex-1 items-center justify-between py-2 text-left font-medium outline-none focus:ring-2 focus:ring-neutral-300 ${className}`}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/** The collapsible body of a section. */
export function AccordionContent({
  className = '',
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={`overflow-hidden text-sm text-neutral-700 data-[state=open]:pb-3 ${className}`}
      {...props}
    >
      {children}
    </AccordionPrimitive.Content>
  );
}
