import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { JoinGroupCard } from "@/components/group/join-group-card";
import { LinkIcon } from "@/components/icons/link-icon";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { getInvite } from "@/lib/data/groups";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Join group",
  description: "Join a Relay group with an invite link.",
};

type JoinPageProps = {
  params: Promise<{ code: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const user = await requireUser();
  const { code } = await params;
  const invite = await getInvite(user.id, code);
  if (invite?.status === "member") redirect(`/chats/${invite.conversationId}` as Route);

  return (
    <main id="main" className="grid flex-1 place-items-center overflow-y-auto bg-surface p-4">
      {invite ? (
        <JoinGroupCard code={code} invite={invite} />
      ) : (
        <EmptyState
          icon={<LinkIcon size={24} />}
          title="This invite link doesn't work"
          description="The link may have been reset by a group admin. Ask for a new one."
        >
          <ButtonLink href="/chats">Back to chats</ButtonLink>
        </EmptyState>
      )}
    </main>
  );
}
