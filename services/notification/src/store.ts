import { randomUUID } from "node:crypto";
import type { UserRole } from "@rpos/types";

export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface StoredNotification {
  id: string;
  userId: string;
  type: string;
  subject: string;
  body: string;
  status: NotificationStatus;
  error: string | null;
  sentAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface Recipient {
  email: string;
  name: string;
}

export interface RoleRecipient extends Recipient {
  userId: string;
}

export interface NotificationStore {
  resolveRecipient(userId: string): Promise<Recipient | null>;
  /** Everyone currently holding any of the given roles (deduped) — for role-broadcast notifications. */
  resolveRecipientsByRole(roles: UserRole | UserRole[]): Promise<RoleRecipient[]>;
  create(data: {
    userId: string;
    type: string;
    subject: string;
    body: string;
  }): Promise<StoredNotification>;
  markSent(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
  listByUser(userId: string, limit: number): Promise<StoredNotification[]>;
  /** Marks one of the user's own notifications read; null if not found or not theirs. */
  markRead(id: string, userId: string): Promise<StoredNotification | null>;
  /** Marks all of the user's unread notifications read; returns how many changed. */
  markAllRead(userId: string): Promise<number>;
  /** Platform-wide delivery counts by status — for the admin executive dashboard. */
  countByStatus(): Promise<Record<NotificationStatus, number>>;
}

export class InMemoryNotificationStore implements NotificationStore {
  private readonly byId = new Map<string, StoredNotification>();
  private readonly recipients = new Map<string, Recipient & { roles: UserRole[] }>();

  addRecipient(userId: string, recipient: Recipient, roles: UserRole[] = []): void {
    this.recipients.set(userId, { ...recipient, roles });
  }

  async resolveRecipient(userId: string): Promise<Recipient | null> {
    const recipient = this.recipients.get(userId);
    return recipient ? { email: recipient.email, name: recipient.name } : null;
  }

  async resolveRecipientsByRole(roles: UserRole | UserRole[]): Promise<RoleRecipient[]> {
    const targets = Array.isArray(roles) ? roles : [roles];
    return [...this.recipients.entries()]
      .filter(([, recipient]) => recipient.roles.some((role) => targets.includes(role)))
      .map(([userId, recipient]) => ({ userId, email: recipient.email, name: recipient.name }));
  }

  async create(data: {
    userId: string;
    type: string;
    subject: string;
    body: string;
  }): Promise<StoredNotification> {
    const notification: StoredNotification = {
      id: randomUUID(),
      ...data,
      status: "PENDING",
      error: null,
      sentAt: null,
      readAt: null,
      createdAt: new Date(),
    };
    this.byId.set(notification.id, notification);
    return notification;
  }

  async markSent(id: string): Promise<void> {
    const existing = this.byId.get(id);
    if (existing) {
      this.byId.set(id, { ...existing, status: "SENT", sentAt: new Date() });
    }
  }

  async markFailed(id: string, error: string): Promise<void> {
    const existing = this.byId.get(id);
    if (existing) {
      this.byId.set(id, { ...existing, status: "FAILED", error });
    }
  }

  async listByUser(userId: string, limit: number): Promise<StoredNotification[]> {
    return [...this.byId.values()]
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async markRead(id: string, userId: string): Promise<StoredNotification | null> {
    const existing = this.byId.get(id);
    if (!existing || existing.userId !== userId) return null;
    const updated = { ...existing, readAt: existing.readAt ?? new Date() };
    this.byId.set(id, updated);
    return updated;
  }

  async markAllRead(userId: string): Promise<number> {
    let changed = 0;
    for (const [id, notification] of this.byId) {
      if (notification.userId === userId && notification.readAt === null) {
        this.byId.set(id, { ...notification, readAt: new Date() });
        changed += 1;
      }
    }
    return changed;
  }

  async countByStatus(): Promise<Record<NotificationStatus, number>> {
    const counts: Record<NotificationStatus, number> = { PENDING: 0, SENT: 0, FAILED: 0 };
    for (const notification of this.byId.values()) {
      counts[notification.status] += 1;
    }
    return counts;
  }
}
