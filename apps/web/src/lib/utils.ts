// These adapted shadcn primitives use non-conflicting class lists; no additional
// runtime class/variant package is needed. Keep callers' classes independent.
export function cn(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ');
}
