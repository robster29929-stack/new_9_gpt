import { z } from 'zod';

/** This engine owns transitions; domain graphs must come from approved design/settings. */
const requestSchema = z.object({
  from: z.string().min(1), to: z.string().min(1),
  expectedRevision: z.number().int().nonnegative(), actualRevision: z.number().int().nonnegative(),
  actorId: z.string().min(1), permissionGranted: z.boolean(),
}).strict();

export type TransitionRequest = z.input<typeof requestSchema>;
export type WorkflowGraph = Readonly<Record<string, readonly string[]>>;
const transitionBrand: unique symbol = Symbol('validated-workflow-transition');
export type WorkflowTransition = Readonly<{
  from: string; to: string; actorId: string; expectedRevision: number;
  nextRevision: number; [transitionBrand]: true;
}>;

export class WorkflowError extends Error {
  constructor(readonly code: 'FORBIDDEN' | 'CONFLICT' | 'INVALID_TRANSITION') {
    super({ FORBIDDEN: 'ไม่มีสิทธิ์เปลี่ยนสถานะรายการนี้', CONFLICT: 'ข้อมูลถูกแก้ไขแล้ว กรุณาโหลดข้อมูลใหม่', INVALID_TRANSITION: 'ไม่อนุญาตให้เปลี่ยนไปยังสถานะที่เลือก' }[code]);
  }
}

/** permissionGranted must be supplied by trusted server-side authorization, never UI claims. */
export function transitionWorkflow(input: TransitionRequest, graph: WorkflowGraph): WorkflowTransition {
  const parsed = requestSchema.parse(input);
  if (!parsed.permissionGranted) throw new WorkflowError('FORBIDDEN');
  if (parsed.actualRevision !== parsed.expectedRevision) throw new WorkflowError('CONFLICT');
  const targets = Object.hasOwn(graph, parsed.from) ? graph[parsed.from] : undefined;
  if (!targets?.includes(parsed.to)) throw new WorkflowError('INVALID_TRANSITION');
  return Object.freeze({ from: parsed.from, to: parsed.to, actorId: parsed.actorId, expectedRevision: parsed.expectedRevision, nextRevision: parsed.actualRevision + 1, [transitionBrand]: true as const });
}
