import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// Adapted from shadcn/ui Button (MIT). Native button only: no asChild/Slot
// dependency, no class-variance-authority. Do not pass variant props to the DOM.
export function Button({className,variant='default',type='button',...props}:ComponentProps<'button'> & {variant?:'default'|'outline'}) {
  return <button data-slot="button" type={type} className={cn(
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold leading-relaxed whitespace-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50',
    variant==='default'?'bg-primary text-primary-foreground hover:brightness-110':'border border-border bg-card text-foreground hover:bg-muted',className,
  )} {...props}/>;
}
