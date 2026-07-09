import { randomUUID } from "node:crypto";

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

export interface NotificationStore {
  resolveRecipient(userId: string): Promise<Recipient | null>;
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
}

export class InMemoryNotificationStore implements NotificationStore {
  private readonly byId = new Map<string, StoredNotification>();
  private readonly recipients = new Map<string, Recipient>();

  addRecipient(userId: string, recipient: Recipient): void {
    this.recipients.set(userId, recipient);
  }

  async resolveRecipient(userId: string): Promise<Recipient | null> {
    return this.recipients.get(userId) ?? null;
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
}
