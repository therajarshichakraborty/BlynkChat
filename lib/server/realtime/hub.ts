import "server-only";
import { Client } from "pg";
import type { RealtimeEvent } from "@/types/realtime";
import { db } from "../db";
import { env } from "../env";
import { channel, isEnvelope, toClientEvent, type Audience, type Envelope } from "./envelope";

export type Subscriber = {
  userId: string;
  send: (event: RealtimeEvent) => void;
};

type Listener = (envelope: Envelope) => void;

const bufferSize = 1000;
const ephemeralTypes = new Set(["typing", "presence"]);

class RealtimeHub {
  private client: Client | null = null;
  private connecting: Promise<void> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly subscribers = new Map<string, Set<Subscriber>>();
  private readonly buffer: Envelope[] = [];
  private readonly listeners = new Set<Listener>();
  private queue: Promise<void> = Promise.resolve();

  ensureListening() {
    if (this.client || this.connecting) return this.connecting ?? Promise.resolve();
    this.connecting = this.connect().finally(() => {
      this.connecting = null;
    });
    return this.connecting;
  }

  private async connect() {
    const client = new Client({ connectionString: env.DATABASE_URL });
    client.on("notification", (message) => {
      if (message.channel !== channel || !message.payload) return;
      this.receive(message.payload);
    });
    client.on("error", (error) => {
      console.error("[relay:realtime] listener error", error);
      this.reset(client);
    });
    client.on("end", () => this.reset(client));
    try {
      await client.connect();
      await client.query(`listen ${channel}`);
      this.client = client;
    } catch (error) {
      console.error("[relay:realtime] listener could not connect", error);
      this.reset(client);
    }
  }

  private reset(client: Client) {
    if (this.client && this.client !== client) return;
    this.client = null;
    client.removeAllListeners();
    void client.end().catch(() => undefined);
    this.broadcastResync("The realtime connection was interrupted.");
    if (this.retryTimer || this.subscriberCount() === 0) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.ensureListening();
    }, 1000);
  }

  private receive(payload: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return;
    }
    if (!isEnvelope(parsed)) return;
    if (!ephemeralTypes.has(parsed.type)) {
      this.buffer.push(parsed);
      if (this.buffer.length > bufferSize) this.buffer.splice(0, this.buffer.length - bufferSize);
    }
    for (const listener of this.listeners) listener(parsed);
    const envelope = parsed;
    this.queue = this.queue.then(() => this.fanOut(envelope));
  }

  private async fanOut(envelope: Envelope) {
    const connected = [...this.subscribers.keys()];
    if (connected.length === 0) return;
    const recipients = await this.resolve(envelope.audience, connected);
    const event = toClientEvent(envelope);
    for (const userId of recipients) {
      for (const subscriber of this.subscribers.get(userId) ?? []) subscriber.send(event);
    }
  }

  private async resolve(audience: Audience, connected: string[]): Promise<string[]> {
    try {
      if (audience.kind === "users") return audience.userIds.filter((id) => this.subscribers.has(id));
      if (audience.kind === "conversation") {
        const members = await db.conversationMember.findMany({
          where: {
            conversationId: audience.conversationId,
            leftAt: null,
            userId: { in: connected.filter((id) => !audience.except?.includes(id)) },
          },
          select: { userId: true },
        });
        return members.map((member) => member.userId);
      }
      const peers = await db.conversationMember.findMany({
        where: {
          userId: { in: connected.filter((id) => id !== audience.userId) },
          leftAt: null,
          conversation: {
            type: audience.directOnly ? "DIRECT" : { in: ["DIRECT", "GROUP"] },
            members: { some: { userId: audience.userId, leftAt: null } },
          },
          user: {
            blocksMade: { none: { blockedId: audience.userId } },
            blocksReceived: { none: { blockerId: audience.userId } },
          },
        },
        select: { userId: true },
        distinct: ["userId"],
      });
      return peers.map((peer) => peer.userId);
    } catch (error) {
      console.error("[relay:realtime] could not resolve recipients", error);
      return [];
    }
  }

  private broadcastResync(reason: string) {
    const event: RealtimeEvent = { id: "", type: "resync", data: { reason } };
    for (const set of this.subscribers.values()) for (const subscriber of set) subscriber.send(event);
  }

  private subscriberCount() {
    let count = 0;
    for (const set of this.subscribers.values()) count += set.size;
    return count;
  }

  connectionsFor(userId: string) {
    return this.subscribers.get(userId)?.size ?? 0;
  }

  subscribe(subscriber: Subscriber) {
    void this.ensureListening();
    const set = this.subscribers.get(subscriber.userId) ?? new Set<Subscriber>();
    set.add(subscriber);
    this.subscribers.set(subscriber.userId, set);
    return () => {
      set.delete(subscriber);
      if (set.size === 0) this.subscribers.delete(subscriber.userId);
    };
  }

  onEnvelope(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async missedSince(userId: string, lastEventId: string): Promise<RealtimeEvent[] | null> {
    const index = this.buffer.findIndex((envelope) => envelope.id === lastEventId);
    if (index === -1) return null;
    const pending = this.buffer.slice(index + 1);
    if (pending.length === 0) return [];
    const memberships = await db.conversationMember.findMany({
      where: { userId, leftAt: null },
      select: { conversationId: true },
    });
    const conversations = new Set(memberships.map((member) => member.conversationId));
    return pending
      .filter(({ audience }) => {
        if (audience.kind === "users") return audience.userIds.includes(userId);
        if (audience.kind === "conversation") {
          return conversations.has(audience.conversationId) && !audience.except?.includes(userId);
        }
        return false;
      })
      .map(toClientEvent);
  }
}

const globalForHub = globalThis as typeof globalThis & { relayHub?: RealtimeHub };

export const hub = globalForHub.relayHub ?? new RealtimeHub();
globalForHub.relayHub = hub;
