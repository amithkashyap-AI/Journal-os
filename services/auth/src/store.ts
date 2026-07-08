import { randomUUID } from "node:crypto";
import type { UserRole } from "@rpos/types";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  roles: UserRole[];
}

export interface UserStore {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  create(input: Omit<StoredUser, "id">): Promise<StoredUser>;
}

export class InMemoryUserStore implements UserStore {
  private readonly byId = new Map<string, StoredUser>();

  async findByEmail(email: string): Promise<StoredUser | null> {
    for (const user of this.byId.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.byId.get(id) ?? null;
  }

  async create(input: Omit<StoredUser, "id">): Promise<StoredUser> {
    const user: StoredUser = { id: randomUUID(), ...input };
    this.byId.set(user.id, user);
    return user;
  }
}
