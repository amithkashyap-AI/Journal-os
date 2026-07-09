import { createLogger } from "@rpos/logger";
import type { UserRole } from "@rpos/types";

type NotificationType =
  | "SUBMISSION_DECISION"
  | "REVIEW_ASSIGNED"
  | "SUBMISSION_SUBMITTED"
  | "REVIEW_FILED"
  | "SUBMISSION_ACCEPTED";

export type NotificationEvent =
  | { userId: string; role?: never; type: NotificationType; data: Record<string, unknown> }
  | {
      /** Broadcasts to everyone holding any of these roles (deduped if a user holds more than one). */
      role: UserRole | UserRole[];
      userId?: never;
      type: NotificationType;
      data: Record<string, unknown>;
    };

export interface Notifier {
  /** Fire-and-forget: implementations must never throw. */
  notify(event: NotificationEvent): Promise<void>;
}

export class NoopNotifier implements Notifier {
  async notify(): Promise<void> {}
}

export class HttpNotifier implements Notifier {
  private readonly log = createLogger("notifier");

  constructor(
    private readonly baseUrl: string,
    private readonly internalSecret: string,
  ) {}

  async notify(event: NotificationEvent): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/notifications`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-secret": this.internalSecret,
        },
        body: JSON.stringify(event),
      });
      if (!res.ok) {
        this.log.warn({ status: res.status, type: event.type }, "notification rejected");
      }
    } catch (error) {
      this.log.warn({ err: error, type: event.type }, "notification delivery failed");
    }
  }
}

export function createNotifier(env: {
  NOTIFICATION_API_URL?: string;
  INTERNAL_API_SECRET?: string;
}): Notifier {
  if (env.NOTIFICATION_API_URL && env.INTERNAL_API_SECRET) {
    return new HttpNotifier(env.NOTIFICATION_API_URL, env.INTERNAL_API_SECRET);
  }
  return new NoopNotifier();
}
