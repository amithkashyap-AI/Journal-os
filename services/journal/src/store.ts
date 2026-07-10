import { randomUUID } from "node:crypto";

export interface StoredPublisher {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredJournal {
  id: string;
  publisherId: string;
  title: string;
  slug: string;
  issn: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalWithPublisher extends StoredJournal {
  publisherName: string;
}

export interface CreateJournalData {
  publisherId: string;
  title: string;
  slug: string;
  issn?: string;
  description?: string;
}

export interface UpdateJournalData {
  title?: string;
  issn?: string;
  description?: string;
}

export interface CreatePublisherData {
  name: string;
  slug: string;
  website?: string;
  ownerId?: string;
}

export interface StoredApiKey {
  id: string;
  publisherId: string;
  key: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
}

export interface JournalStore {
  listJournals(): Promise<JournalWithPublisher[]>;
  findJournalById(id: string): Promise<JournalWithPublisher | null>;
  findJournalBySlug(slug: string): Promise<StoredJournal | null>;
  createJournal(data: CreateJournalData): Promise<StoredJournal>;
  updateJournal(id: string, patch: UpdateJournalData): Promise<StoredJournal>;
  listPublishers(): Promise<StoredPublisher[]>;
  /** Publishers owned by the given user — for the publisher portal's "my organizations" view. */
  listPublishersByOwner(ownerId: string): Promise<StoredPublisher[]>;
  findPublisherById(id: string): Promise<StoredPublisher | null>;
  findPublisherBySlug(slug: string): Promise<StoredPublisher | null>;
  createPublisher(data: CreatePublisherData): Promise<StoredPublisher>;

  /** At most one API key per publisher. */
  findApiKeyByPublisherId(publisherId: string): Promise<StoredApiKey | null>;
  /** For authenticating an incoming x-api-key header. */
  findApiKeyByValue(key: string): Promise<StoredApiKey | null>;
  createApiKey(publisherId: string, key: string): Promise<StoredApiKey>;
  /** Replaces the key value, re-enabling it. */
  regenerateApiKey(publisherId: string, key: string): Promise<StoredApiKey>;
  setApiKeyEnabled(publisherId: string, enabled: boolean): Promise<StoredApiKey>;
  deleteApiKey(publisherId: string): Promise<void>;
  touchApiKeyLastUsed(id: string): Promise<void>;
}

export class InMemoryJournalStore implements JournalStore {
  private readonly journals = new Map<string, StoredJournal>();
  private readonly publishers = new Map<string, StoredPublisher>();
  private readonly apiKeys = new Map<string, StoredApiKey>(); // keyed by publisherId

  private withPublisher(journal: StoredJournal): JournalWithPublisher {
    return {
      ...journal,
      publisherName: this.publishers.get(journal.publisherId)?.name ?? "Unknown",
    };
  }

  async listJournals(): Promise<JournalWithPublisher[]> {
    return [...this.journals.values()].map((journal) => this.withPublisher(journal));
  }

  async findJournalById(id: string): Promise<JournalWithPublisher | null> {
    const journal = this.journals.get(id);
    return journal ? this.withPublisher(journal) : null;
  }

  async findJournalBySlug(slug: string): Promise<StoredJournal | null> {
    return [...this.journals.values()].find((journal) => journal.slug === slug) ?? null;
  }

  async createJournal(data: CreateJournalData): Promise<StoredJournal> {
    const now = new Date();
    const journal: StoredJournal = {
      id: randomUUID(),
      publisherId: data.publisherId,
      title: data.title,
      slug: data.slug,
      issn: data.issn ?? null,
      description: data.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.journals.set(journal.id, journal);
    return journal;
  }

  async updateJournal(id: string, patch: UpdateJournalData): Promise<StoredJournal> {
    const existing = this.journals.get(id);
    if (!existing) throw new Error(`Journal not found: ${id}`);
    const updated: StoredJournal = { ...existing, ...patch, updatedAt: new Date() };
    this.journals.set(id, updated);
    return updated;
  }

  async listPublishers(): Promise<StoredPublisher[]> {
    return [...this.publishers.values()];
  }

  async listPublishersByOwner(ownerId: string): Promise<StoredPublisher[]> {
    return [...this.publishers.values()].filter((publisher) => publisher.ownerId === ownerId);
  }

  async findPublisherById(id: string): Promise<StoredPublisher | null> {
    return this.publishers.get(id) ?? null;
  }

  async findPublisherBySlug(slug: string): Promise<StoredPublisher | null> {
    return [...this.publishers.values()].find((publisher) => publisher.slug === slug) ?? null;
  }

  async createPublisher(data: CreatePublisherData): Promise<StoredPublisher> {
    const now = new Date();
    const publisher: StoredPublisher = {
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      website: data.website ?? null,
      ownerId: data.ownerId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.publishers.set(publisher.id, publisher);
    return publisher;
  }

  async findApiKeyByPublisherId(publisherId: string): Promise<StoredApiKey | null> {
    return this.apiKeys.get(publisherId) ?? null;
  }

  async findApiKeyByValue(key: string): Promise<StoredApiKey | null> {
    return [...this.apiKeys.values()].find((apiKey) => apiKey.key === key) ?? null;
  }

  async createApiKey(publisherId: string, key: string): Promise<StoredApiKey> {
    const now = new Date();
    const apiKey: StoredApiKey = {
      id: randomUUID(),
      publisherId,
      key,
      enabled: true,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: null,
    };
    this.apiKeys.set(publisherId, apiKey);
    return apiKey;
  }

  async regenerateApiKey(publisherId: string, key: string): Promise<StoredApiKey> {
    const existing = this.apiKeys.get(publisherId);
    if (!existing) throw new Error(`No API key for publisher: ${publisherId}`);
    const updated: StoredApiKey = { ...existing, key, enabled: true, updatedAt: new Date() };
    this.apiKeys.set(publisherId, updated);
    return updated;
  }

  async setApiKeyEnabled(publisherId: string, enabled: boolean): Promise<StoredApiKey> {
    const existing = this.apiKeys.get(publisherId);
    if (!existing) throw new Error(`No API key for publisher: ${publisherId}`);
    const updated: StoredApiKey = { ...existing, enabled, updatedAt: new Date() };
    this.apiKeys.set(publisherId, updated);
    return updated;
  }

  async deleteApiKey(publisherId: string): Promise<void> {
    this.apiKeys.delete(publisherId);
  }

  async touchApiKeyLastUsed(id: string): Promise<void> {
    for (const [publisherId, apiKey] of this.apiKeys) {
      if (apiKey.id === id) {
        this.apiKeys.set(publisherId, { ...apiKey, lastUsedAt: new Date() });
        return;
      }
    }
  }
}
