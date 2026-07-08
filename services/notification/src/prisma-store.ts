import { getPrisma } from "@rpos/database";
import type { NotificationStore, Recipient, StoredNotification } from "./store.js";

export class PrismaNotificationStore implements NotificationStore {
  private readonly db = getPrisma();

  async resolveRecipient(userId: string): Promise<Recipient | null> {
    return this.db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
  }

  async create(data: {
    userId: string;
    type: string;
    subject: string;
    body: string;
  }): Promise<StoredNotification> {
    return this.db.notification.create({ data });
  }

  async markSent(id: string): Promise<void> {
    await this.db.notification.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date() },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.db.notification.update({
      where: { id },
      data: { status: "FAILED", error },
    });
  }

  async listByUser(userId: string, limit: number): Promise<StoredNotification[]> {
    return this.db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
