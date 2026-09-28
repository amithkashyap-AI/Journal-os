import { randomUUID } from "node:crypto";
import type { UserRole } from "@rpos/types";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  active: boolean;
  roles: UserRole[];
}

/** A custom (or system, for display) role with its flattened permission keys. */
export interface StoredRole {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionKeys: string[];
}

export interface CreateRoleData {
  key: string;
  name: string;
  description?: string;
  permissionKeys: string[];
  createdByUserId?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissionKeys?: string[];
}

export interface UserStore {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  listByRole(role: UserRole): Promise<StoredUser[]>;
  listAll(): Promise<StoredUser[]>;
  create(input: Omit<StoredUser, "id" | "active"> & { active?: boolean }): Promise<StoredUser>;
  updateRoles(id: string, roles: UserRole[]): Promise<StoredUser>;
  updateActive(id: string, active: boolean): Promise<StoredUser>;

  /** Custom roles only (isSystem=false) — the ones an Admin can manage. */
  listCustomRoles(): Promise<StoredRole[]>;
  findRoleById(id: string): Promise<StoredRole | null>;
  findRoleByKey(key: string): Promise<StoredRole | null>;
  createRole(data: CreateRoleData): Promise<StoredRole>;
  /** Throws if the role is a system role. */
  updateRole(id: string, patch: UpdateRoleData): Promise<StoredRole>;
  /** Throws if the role is a system role. */
  deleteRole(id: string): Promise<void>;

  assignRole(userId: string, roleId: string): Promise<void>;
  unassignRole(userId: string, roleId: string): Promise<void>;
  /** Flattened, deduped permission keys across all of a user's assigned custom roles. */
  getUserPermissions(userId: string): Promise<string[]>;
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

  async listByRole(role: UserRole): Promise<StoredUser[]> {
    return [...this.byId.values()].filter((user) => user.roles.includes(role));
  }

  async listAll(): Promise<StoredUser[]> {
    return [...this.byId.values()];
  }

  async create(input: Omit<StoredUser, "id" | "active"> & { active?: boolean }): Promise<StoredUser> {
    const user: StoredUser = { id: randomUUID(), active: input.active ?? true, ...input };
    this.byId.set(user.id, user);
    return user;
  }

  async updateRoles(id: string, roles: UserRole[]): Promise<StoredUser> {
    const user = this.byId.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, roles };
    this.byId.set(id, updated);
    return updated;
  }

  async updateActive(id: string, active: boolean): Promise<StoredUser> {
    const user = this.byId.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, active };
    this.byId.set(id, updated);
    return updated;
  }

  private readonly roles = new Map<string, StoredRole>();
  private readonly userRoles = new Map<string, Set<string>>(); // userId -> roleIds

  async listCustomRoles(): Promise<StoredRole[]> {
    return [...this.roles.values()].filter((role) => !role.isSystem);
  }

  async findRoleById(id: string): Promise<StoredRole | null> {
    return this.roles.get(id) ?? null;
  }

  async findRoleByKey(key: string): Promise<StoredRole | null> {
    return [...this.roles.values()].find((role) => role.key === key) ?? null;
  }

  async createRole(data: CreateRoleData): Promise<StoredRole> {
    const role: StoredRole = {
      id: randomUUID(),
      key: data.key,
      name: data.name,
      description: data.description ?? null,
      isSystem: false,
      permissionKeys: data.permissionKeys,
    };
    this.roles.set(role.id, role);
    return role;
  }

  async updateRole(id: string, patch: UpdateRoleData): Promise<StoredRole> {
    const existing = this.roles.get(id);
    if (!existing) throw new Error("Role not found");
    if (existing.isSystem) throw new Error("Cannot modify a system role");
    const updated: StoredRole = { ...existing, ...patch };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: string): Promise<void> {
    const existing = this.roles.get(id);
    if (!existing) return;
    if (existing.isSystem) throw new Error("Cannot delete a system role");
    this.roles.delete(id);
    for (const set of this.userRoles.values()) set.delete(id);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const set = this.userRoles.get(userId) ?? new Set<string>();
    set.add(roleId);
    this.userRoles.set(userId, set);
  }

  async unassignRole(userId: string, roleId: string): Promise<void> {
    this.userRoles.get(userId)?.delete(roleId);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const roleIds = this.userRoles.get(userId);
    if (!roleIds) return [];
    const keys = new Set<string>();
    for (const roleId of roleIds) {
      const role = this.roles.get(roleId);
      role?.permissionKeys.forEach((key) => keys.add(key));
    }
    return [...keys];
  }

  /** Test helper for seeding a system role directly (e.g. to test findRoleByKey without the full createRole flow). */
  setSystemRole(role: StoredRole): void {
    this.roles.set(role.id, role);
  }
}
