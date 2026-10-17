import { z } from "zod";

export class AuthorizationError extends Error {
  constructor() {
    super("ไม่มีสิทธิ์ดำเนินการนี้");
  }
}

export interface AuditEvent {
  readonly actorId: string;
  readonly action: string;
  readonly entityId: string;
  readonly summary: string;
}

export interface ActionDependencies<Input, Result, Transaction> {
  readonly schema: z.ZodType<Input>;
  /** Must resolve a trusted actor/scope from server authentication and can_access(). */
  readonly authorize: (
    input: Input,
  ) => Promise<{ readonly actorId: string } | null>;
  /** The adapter MUST roll back writes if audit fails. No default adapter is provided. */
  readonly transaction: <T>(
    operation: (tx: Transaction) => Promise<T>,
  ) => Promise<T>;
  readonly write: (
    tx: Transaction,
    input: Input,
    actorId: string,
  ) => Promise<Result>;
  readonly describeAudit: (result: Result, actorId: string) => AuditEvent;
  readonly appendAudit: (tx: Transaction, event: AuditEvent) => Promise<void>;
}

/** Validation -> authorization -> one transaction containing write + audit. */
export async function executeAction<Input, Result, Transaction>(
  rawInput: unknown,
  dependencies: ActionDependencies<Input, Result, Transaction>,
): Promise<Result> {
  const input = dependencies.schema.parse(rawInput);
  const actor = await dependencies.authorize(input);
  if (!actor) throw new AuthorizationError();
  return dependencies.transaction(async (tx) => {
    const result = await dependencies.write(tx, input, actor.actorId);
    const event = dependencies.describeAudit(result, actor.actorId);
    if (event.actorId !== actor.actorId) throw new AuthorizationError();
    await dependencies.appendAudit(tx, event);
    return result;
  });
}
