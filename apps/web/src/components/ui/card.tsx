import type {ComponentProps} from 'react';
import {cn} from '@/lib/utils';
// Adapted shadcn/ui Card primitive (MIT).
export function Card({className,...props}:ComponentProps<'section'>){
  return <section data-slot="card" className={cn('min-w-0 rounded-2xl border border-border bg-card p-6 shadow-sm',className)} {...props}/>;
}
