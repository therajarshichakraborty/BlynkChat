import { hub } from "@/lib/server/realtime/hub";
import { markDisconnected, markOnline } from "@/lib/server/services/presence";
import { purgeExpiredMessages } from "@/lib/server/services/group-settings";
import { markAllDelivered, noteDelivered } from "@/lib/server/services/receipts";
import { getSessionUser } from "@/lib/server/session";
import type { RealtimeEvent } from "@/types/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const heartbeatMs = 25_000;

function serialize(event: RealtimeEvent) {
  const id = event.id ? `id: ${event.id}\n` : "";
  return `${id}data: ${JSON.stringify(event)}\n\n`;
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const lastEventId = request.headers.get("last-event-id") || url.searchParams.get("lastEventId") || null;
  const encoder = new TextEncoder();
  let close = () => undefined as void;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const timers: { heartbeat?: ReturnType<typeof setInterval> } = {};
      let unsubscribe = () => undefined as void;

      const write = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          close();
        }
      };

      close = () => {
        if (closed) return;
        closed = true;
        clearInterval(timers.heartbeat);
        unsubscribe();
        if (hub.connectionsFor(user.id) === 0) markDisconnected(user.id);
        try {
          controller.close();
        } catch {}
      };

      request.signal.addEventListener("abort", () => close());
      write("retry: 3000\n\n");
      await hub.ensureListening();
      if (closed) return;
      unsubscribe = hub.subscribe({
        userId: user.id,
        send: (event) => {
          write(serialize(event));
          if (event.type === "message.created" && event.data.senderId !== user.id && !event.data.threadRootId) {
            noteDelivered(user.id, event.data.conversationId);
          }
        },
      });
      void markAllDelivered(user.id).catch((error: unknown) => console.error("[relay:receipts]", error));
      void purgeExpiredMessages().catch((error: unknown) => console.error("[relay:purge]", error));
      void markOnline(user.id, hub.connectionsFor(user.id) === 1).catch((error: unknown) =>
        console.error("[relay:presence]", error),
      );

      if (lastEventId) {
        const missed = await hub.missedSince(user.id, lastEventId);
        if (missed === null) write(serialize({ id: "", type: "resync", data: { reason: "Missed events expired." } }));
        else for (const event of missed) write(serialize(event));
      }

      timers.heartbeat = setInterval(() => write(": ping\n\n"), heartbeatMs);
    },
    cancel() {
      close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
