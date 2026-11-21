import type { DeliveryStatus, MessageView, ReceiptView } from "@/types/message";

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function deliveryStatus(message: MessageView, receipts: ReceiptView[]): DeliveryStatus {
  if (receipts.length === 0) return "sent";
  const created = Date.parse(message.createdAt);
  const reached = (value: string | null) => value !== null && Date.parse(value) >= created;
  if (receipts.every((receipt) => reached(receipt.lastReadAt))) return "read";
  if (receipts.every((receipt) => reached(receipt.lastDeliveredAt) || reached(receipt.lastReadAt))) return "delivered";
  return "sent";
}

export function attachmentLabel(message: Pick<MessageView, "kind" | "attachments">) {
  if (message.kind === "voice") return "Voice message";
  if (message.kind === "image") return "Photo";
  if (message.kind === "poll") return "Poll";
  return message.attachments[0]?.name ?? "Attachment";
}

export function messageSnippet(message: Pick<MessageView, "kind" | "attachments" | "body" | "deleted">) {
  if (message.deleted) return "This message was deleted";
  return message.body || attachmentLabel(message);
}
