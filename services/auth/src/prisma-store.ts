import { getPrisma } from "@rpos/database";
import type { UserRole } from "@rpos/types";
import type {
  CreateRoleData,
  StoredRole,
  StoredUser,
  UpdateRoleData,
  UserStore,
} from "./store.js";

function flattenRole(role: {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: { permission: { key: string } }[];
}): StoredRole {
  return {
    id: role.id,
    key: role.key,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissionKeys: role.permissions.map((p) => p.permission.key),
  };
}

const roleInclude = { permissions: { include: { permission: true } } } as const;

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

  async listCustomRoles(): Promise<StoredRole[]> {
    const roles = await this.db.role.findMany({
      where: { isSystem: false },
      include: roleInclude,
      orderBy: { name: "asc" },
    });
    return roles.map(flattenRole);
  }

  async findRoleById(id: string): Promise<StoredRole | null> {
    const role = await this.db.role.findUnique({ where: { id }, include: roleInclude });
    return role ? flattenRole(role) : null;
  }

  async findRoleByKey(key: string): Promise<StoredRole | null> {
    const role = await this.db.role.findUnique({ where: { key }, include: roleInclude });
    return role ? flattenRole(role) : null;
  }

  async createRole(data: CreateRoleData): Promise<StoredRole> {
    const permissions = await this.db.permission.findMany({
      where: { key: { in: data.permissionKeys } },
    });
    const role = await this.db.role.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        isSystem: false,
        createdByUserId: data.createdByUserId,
        permissions: {
          create: permissions.map((p) => ({ permissionId: p.id })),
        },
      },
      include: roleInclude,
    });
    return flattenRole(role);
  }

  async updateRole(id: string, patch: UpdateRoleData): Promise<StoredRole> {
    const existing = await this.db.role.findUnique({ where: { id } });
    if (!existing) throw new Error("Role not found");
    if (existing.isSystem) throw new Error("Cannot modify a system role");

    let permissionUpdate = {};
    if (patch.permissionKeys) {
      const permissions = await this.db.permission.findMany({
        where: { key: { in: patch.permissionKeys } },
      });
      permissionUpdate = {
        permissions: {
          deleteMany: {},
          create: permissions.map((p) => ({ permissionId: p.id })),
        },
      };
    }

    const role = await this.db.role.update({
      where: { id },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...permissionUpdate,
      },
      include: roleInclude,
    });
    return flattenRole(role);
  }

  async deleteRole(id: string): Promise<void> {
    const existing = await this.db.role.findUnique({ where: { id } });
    if (!existing) return;
    if (existing.isSystem) throw new Error("Cannot delete a system role");
    await this.db.role.delete({ where: { id } });
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.db.userCustomRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
  }

  async unassignRole(userId: string, roleId: string): Promise<void> {
    await this.db.userCustomRole.deleteMany({ where: { userId, roleId } });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const assignments = await this.db.userCustomRole.findMany({
      where: { userId },
      include: { role: { include: roleInclude } },
    });
    const keys = new Set<string>();
    for (const assignment of assignments) {
      flattenRole(assignment.role).permissionKeys.forEach((key) => keys.add(key));
    }
    return [...keys];
  }
}

