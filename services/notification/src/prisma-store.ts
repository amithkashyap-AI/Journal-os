import { getPrisma } from "@rpos/database";
import type { UserRole } from "@rpos/types";
import type { NotificationStore, Recipient, RoleRecipient, StoredNotification } from "./store.js";

export class PrismaNotificationStore implements NotificationStore {
  private readonly db = getPrisma();

  async resolveRecipient(userId: string): Promise<Recipient | null> {
    return this.db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
  }

  async resolveRecipientsByRole(roles: UserRole | UserRole[]): Promise<RoleRecipient[]> {
    const targets = Array.isArray(roles) ? roles : [roles];
    const users = await this.db.user.findMany({
      where: { roles: { hasSome: targets } },
      select: { id: true, email: true, name: true },
    });
    return users.map((user) => ({ userId: user.id, email: user.email, name: user.name }));
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

  async markRead(id: string, userId: string): Promise<StoredNotification | null> {
    const existing = await this.db.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return null;
    if (existing.readAt) return existing;
    return this.db.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  async markAllRead(userId: string): Promise<number> {
    const { count } = await this.db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return count;
  }
}
