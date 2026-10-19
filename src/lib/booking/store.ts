/**
 * Booking store: one interface, swappable adapters. Server only.
 *
 * Select the adapter with BOOKING_STORE:
 * - "file"   (default locally): JSON file under data/ (BOOKING_DATA_DIR overrides). Good for dev and a
 *            single long-running server.
 * - "memory" (default on Vercel when BOOKING_STORE is unset): process memory only. Each request is also
 *            written to the runtime log as one JSON line (phase 1a in docs/booking-architecture.md), and
 *            the host email is the durable record.
 * - "postgres": reserved for the Neon/Supabase adapter described in docs/booking-architecture.md
 *            (tables booking_requests, bookings, stripe_events with the daterange exclusion constraint).
 *            Not implemented yet; selecting it throws so it cannot silently lose data.
 *
 * IMPORTANT: Vercel's filesystem is read-only and ephemeral (only /tmp is writable, and it is wiped
 * between invocations and not shared between instances). The file adapter is NOT a production store.
 * Production with real availability blocking or Stripe (phase 1b+) needs the database adapter.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { Quote } from "@/content/site.config";
import type { ISODate } from "./dates";

export type BookingStatus = "requested" | "hold" | "confirmed" | "cancelled" | "expired" | "declined";

export type BookingRecord = {
  /** Public reference, e.g. POT-2610-7F3K. Also the id. */
  id: string;
  createdAt: string;
  updatedAt: string;
  status: BookingStatus;
  kind: "request" | "checkout";
  checkIn: ISODate;
  checkOut: ISODate;
  adults: number;
  children: number;
  infants: number;
  name: string;
  email: string;
  phone: string;
  arrivalTime?: string;
  message?: string;
  source?: string;
  /** Full server-side computeQuote() output at request time. */
  quote: Quote;
  emailStatus: "pending" | "sent" | "logged" | "failed" | "skipped";
  ipHash?: string;
  /** Phase 3 */
  holdExpiresAt?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  amountDueNowCents?: number;
  amountPaidCents?: number;
  amountRefundedCents?: number;
  agreementAcceptedAt?: string;
};

export interface BookingStore {
  readonly kind: string;
  create(record: BookingRecord): Promise<BookingRecord>;
  get(id: string): Promise<BookingRecord | null>;
  update(id: string, patch: Partial<BookingRecord>): Promise<BookingRecord | null>;
  /** Bookings that occupy nights: confirmed, plus holds that have not expired. */
  listActive(now?: Date): Promise<BookingRecord[]>;
  findByCheckoutSession(sessionId: string): Promise<BookingRecord | null>;
  /**
   * Create a hold only if no active booking overlaps [checkIn, checkOut). Atomic within the adapter
   * (the Postgres adapter gets this from the exclusion constraint). Returns null on conflict.
   */
  createHoldIfFree(record: BookingRecord): Promise<BookingRecord | null>;
  /** Webhook idempotency. Returns true the first time an event id is seen. */
  recordEvent(eventId: string): Promise<boolean>;
  /** Release an event id after a failed handler so Stripe's retry is processed. */
  forgetEvent(eventId: string): Promise<void>;
}

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O, 1/I/L

export function newRef(now: Date = new Date()): string {
  const yymm = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const bytes = randomBytes(4);
  let tail = "";
  for (const b of bytes) tail += ALPHABET[b % ALPHABET.length];
  return `POT-${yymm}-${tail}`;
}

export function isActive(r: BookingRecord, now: Date = new Date()): boolean {
  if (r.status === "confirmed") return true;
  if (r.status === "hold") return !r.holdExpiresAt || new Date(r.holdExpiresAt) > now;
  return false;
}

const overlaps = (a: { checkIn: string; checkOut: string }, b: { checkIn: string; checkOut: string }) =>
  a.checkIn < b.checkOut && b.checkIn < a.checkOut;

/* ------------------------------------------------------------------ */
/* Memory adapter (also the base for the file adapter)                 */
/* ------------------------------------------------------------------ */

type Data = { bookings: BookingRecord[]; events: string[] };

class MemoryStore implements BookingStore {
  readonly kind: string = "memory";
  protected data: Data = { bookings: [], events: [] };
  private chain: Promise<unknown> = Promise.resolve();

  /** Serialize all operations so read-modify-write is atomic within this process. */
  protected run<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.chain.then(fn, fn);
    this.chain = next.catch(() => undefined);
    return next;
  }
  protected async load(): Promise<void> {}
  protected async save(): Promise<void> {}

  create(record: BookingRecord) {
    return this.run(async () => {
      await this.load();
      this.data.bookings.push(record);
      await this.save();
      return record;
    });
  }
  get(id: string) {
    return this.run(async () => {
      await this.load();
      return this.data.bookings.find((b) => b.id === id) ?? null;
    });
  }
  update(id: string, patch: Partial<BookingRecord>) {
    return this.run(async () => {
      await this.load();
      const b = this.data.bookings.find((x) => x.id === id);
      if (!b) return null;
      Object.assign(b, patch, { id: b.id, updatedAt: new Date().toISOString() });
      await this.save();
      return b;
    });
  }
  listActive(now: Date = new Date()) {
    return this.run(async () => {
      await this.load();
      return this.data.bookings.filter((b) => isActive(b, now));
    });
  }
  findByCheckoutSession(sessionId: string) {
    return this.run(async () => {
      await this.load();
      return this.data.bookings.find((b) => b.stripeCheckoutSessionId === sessionId) ?? null;
    });
  }
  createHoldIfFree(record: BookingRecord) {
    return this.run(async () => {
      await this.load();
      const now = new Date();
      if (this.data.bookings.some((b) => isActive(b, now) && overlaps(b, record))) return null;
      this.data.bookings.push(record);
      await this.save();
      return record;
    });
  }
  recordEvent(eventId: string) {
    return this.run(async () => {
      await this.load();
      if (this.data.events.includes(eventId)) return false;
      this.data.events.push(eventId);
      if (this.data.events.length > 5000) this.data.events = this.data.events.slice(-5000);
      await this.save();
      return true;
    });
  }
  forgetEvent(eventId: string) {
    return this.run(async () => {
      await this.load();
      this.data.events = this.data.events.filter((e) => e !== eventId);
      await this.save();
    });
  }
}

/* ------------------------------------------------------------------ */
/* File adapter (dev)                                                  */
/* ------------------------------------------------------------------ */

class FileStore extends MemoryStore {
  readonly kind = "file";
  constructor(private file: string) {
    super();
  }
  protected async load() {
    try {
      const text = await fs.readFile(this.file, "utf8");
      const parsed = JSON.parse(text) as Partial<Data>;
      this.data = { bookings: parsed.bookings ?? [], events: parsed.events ?? [] };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      this.data = { bookings: [], events: [] };
    }
  }
  protected async save() {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(this.data, null, 2), "utf8");
    await fs.rename(tmp, this.file); // atomic replace
  }
}

/* ------------------------------------------------------------------ */
/* Factory                                                             */
/* ------------------------------------------------------------------ */

export function createStore(kind?: string): BookingStore {
  const selected = kind ?? process.env.BOOKING_STORE ?? (process.env.VERCEL ? "memory" : "file");
  switch (selected) {
    case "memory":
      return new MemoryStore();
    case "file": {
      const dir = process.env.BOOKING_DATA_DIR ?? path.join(process.cwd(), "data");
      return new FileStore(path.join(dir, "bookings.json"));
    }
    case "postgres":
      throw new Error(
        "BOOKING_STORE=postgres is not implemented yet. Add a Postgres adapter per docs/booking-architecture.md (schema section) and register it here.",
      );
    default:
      throw new Error(`Unknown BOOKING_STORE "${selected}". Use file, memory or postgres.`);
  }
}

const g = globalThis as unknown as { __potBookingStore?: BookingStore };

/** Process-wide singleton (survives dev hot reloads). */
export function getStore(): BookingStore {
  if (!g.__potBookingStore) g.__potBookingStore = createStore();
  return g.__potBookingStore;
}

/** Tests only. */
export function setStoreForTests(store: BookingStore | undefined) {
  g.__potBookingStore = store;
}
