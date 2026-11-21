import { z } from "zod";
import { ServiceError } from "@/lib/server/errors";
import { signalTyping } from "@/lib/server/services/presence";
import { getSessionUser } from "@/lib/server/session";
import { idSchema } from "@/lib/validation/common";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const typingSchema = z.object({ conversationId: idSchema });

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Log in again." } }, { status: 401 });
  }

  const parsed = typingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: { code: "VALIDATION", message: "Invalid request." } }, { status: 400 });
  }

  try {
    const sent = await signalTyping(user.id, parsed.data.conversationId);
    return Response.json({ ok: true, data: { sent } });
  } catch (error) {
    if (error instanceof ServiceError) {
      return Response.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 403 });
    }
    throw error;
  }
}
