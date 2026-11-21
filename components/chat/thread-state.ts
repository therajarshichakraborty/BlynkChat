import type { MessagePage, MessageView, ReceiptView } from "@/types/message";

export type ThreadMessage = MessageView & { pending?: "sending" | "failed" };

export type ThreadState = {
  messages: ThreadMessage[];
  nextCursor: string | null;
  receipts: ReceiptView[];
};

export type ThreadAction =
  | { type: "older"; page: MessagePage }
  | { type: "latest"; page: MessagePage }
  | { type: "upsert"; message: MessageView }
  | { type: "failed"; message: ThreadMessage }
  | { type: "discard"; clientId: string }
  | { type: "hide"; messageId: string }
  | { type: "receipt"; receipt: ReceiptView };

function latest(a: string | null, b: string | null) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function byTime(a: ThreadMessage, b: ThreadMessage) {
  return a.createdAt === b.createdAt ? a.id.localeCompare(b.id) : a.createdAt < b.createdAt ? -1 : 1;
}

function upsert(messages: ThreadMessage[], message: ThreadMessage) {
  const index = messages.findIndex(
    (item) => item.id === message.id || (message.clientId !== null && item.clientId === message.clientId),
  );
  if (index === -1) return [...messages, message].sort(byTime);
  const next = messages.slice();
  next[index] = message;
  return next;
}

export function threadReducer(state: ThreadState, action: ThreadAction): ThreadState {
  switch (action.type) {
    case "older": {
      const known = new Set(state.messages.map((message) => message.id));
      const fresh = action.page.messages.filter((message) => !known.has(message.id));
      return { ...state, messages: [...fresh, ...state.messages], nextCursor: action.page.nextCursor };
    }
    case "latest":
      return { ...state, messages: action.page.messages.reduce(upsert, state.messages) };
    case "upsert":
      return { ...state, messages: upsert(state.messages, action.message) };
    case "failed":
      return { ...state, messages: upsert(state.messages, action.message) };
    case "discard":
      return { ...state, messages: state.messages.filter((message) => message.clientId !== action.clientId) };
    case "hide":
      return { ...state, messages: state.messages.filter((message) => message.id !== action.messageId) };
    case "receipt":
      return {
        ...state,
        receipts: state.receipts.map((receipt) =>
          receipt.userId === action.receipt.userId
            ? {
                userId: receipt.userId,
                lastReadAt: latest(receipt.lastReadAt, action.receipt.lastReadAt),
                lastDeliveredAt: latest(receipt.lastDeliveredAt, action.receipt.lastDeliveredAt),
              }
            : receipt,
        ),
      };
  }
}
