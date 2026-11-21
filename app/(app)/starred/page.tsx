import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { StarredMessage } from "@/components/chat/starred-message";
import { StarIcon } from "@/components/icons/star-icon";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getStarredMessages } from "@/lib/data/starred";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Starred messages",
  description: "Messages you starred across your chats, groups and rooms.",
};

export default async function StarredPage() {
  const user = await requireUser();
  const items = await getStarredMessages(user.id);

  return (
    <main id="main" className="min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Starred</h1>
          <p className="text-base text-muted">Messages you starred to find them again later.</p>
        </header>
        {items.length === 0 ? (
          <EmptyState
            icon={<StarIcon size={24} />}
            title="No starred messages"
            description="Open the options on any message and choose Star to keep it here."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.message.id} className="rounded-xl border border-line bg-card p-4 shadow-sm">
                <Link
                  href={`${item.conversation.href}#message-${item.message.id}` as Route}
                  className="flex items-center gap-2.5 text-sm text-muted hover:text-fg"
                >
                  <Avatar initials={item.conversation.initials} tone={item.conversation.tone} size="sm" />
                  <span className="truncate font-medium">{item.conversation.title}</span>
                </Link>
                <StarredMessage message={item.message} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
