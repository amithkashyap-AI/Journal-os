import { getPrisma } from "@rpos/database";
import type { UserRole } from "@rpos/types";
import type { StoredUser, UserStore } from "./store.js";

export class PrismaUserStore implements UserStore {
  private readonly db = getPrisma();

  async findByEmail(email: string): Promise<StoredUser | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<StoredUser | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async listByRole(role: UserRole): Promise<StoredUser[]> {
    return this.db.user.findMany({
      where: { roles: { has: role } },
      orderBy: { name: "asc" },
    });
  }

  async listAll(): Promise<StoredUser[]> {
    return this.db.user.findMany({
      orderBy: { email: "asc" },
    });
  }

  async create(input: Omit<StoredUser, "id">): Promise<StoredUser> {
    return this.db.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
        roles: input.roles,
      },
    });
  }

  async updateRoles(id: string, roles: UserRole[]): Promise<StoredUser> {
    return this.db.user.update({
      where: { id },
      data: { roles },
    });
  }
}

