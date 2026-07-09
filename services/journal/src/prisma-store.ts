import { getPrisma } from "@rpos/database";
import type {
  CreateJournalData,
  CreatePublisherData,
  JournalStore,
  JournalWithPublisher,
  StoredJournal,
  StoredPublisher,
  UpdateJournalData,
} from "./store.js";

type JournalRecord = StoredJournal & { publisher: { name: string } };

function flatten(journal: JournalRecord): JournalWithPublisher {
  const { publisher, ...rest } = journal;
  return { ...rest, publisherName: publisher.name };
}

export class PrismaJournalStore implements JournalStore {
  private readonly db = getPrisma();

  async listJournals(): Promise<JournalWithPublisher[]> {
    const journals = await this.db.journal.findMany({
      include: { publisher: { select: { name: true } } },
      orderBy: { title: "asc" },
    });
    return journals.map(flatten);
  }

  async findJournalById(id: string): Promise<JournalWithPublisher | null> {
    const journal = await this.db.journal.findUnique({
      where: { id },
      include: { publisher: { select: { name: true } } },
    });
    return journal ? flatten(journal) : null;
  }

  async findJournalBySlug(slug: string): Promise<StoredJournal | null> {
    return this.db.journal.findUnique({ where: { slug } });
  }

  async createJournal(data: CreateJournalData): Promise<StoredJournal> {
    return this.db.journal.create({ data });
  }

  async updateJournal(id: string, patch: UpdateJournalData): Promise<StoredJournal> {
    return this.db.journal.update({ where: { id }, data: patch });
  }

  async listPublishers(): Promise<StoredPublisher[]> {
    return this.db.publisher.findMany({ orderBy: { name: "asc" } });
  }

  async listPublishersByOwner(ownerId: string): Promise<StoredPublisher[]> {
    return this.db.publisher.findMany({ where: { ownerId }, orderBy: { name: "asc" } });
  }

  async findPublisherById(id: string): Promise<StoredPublisher | null> {
    return this.db.publisher.findUnique({ where: { id } });
  }

  async findPublisherBySlug(slug: string): Promise<StoredPublisher | null> {
    return this.db.publisher.findUnique({ where: { slug } });
  }

  async createPublisher(data: CreatePublisherData): Promise<StoredPublisher> {
    return this.db.publisher.create({ data });
  }
}
