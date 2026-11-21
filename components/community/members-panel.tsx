import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils/cn";
import type { MemberView } from "@/types/conversation";

type MemberGroupProps = {
  id: string;
  title: string;
  members: MemberView[];
  dimmed?: boolean;
};

function MemberGroup({ id, title, members, dimmed = false }: MemberGroupProps) {
  if (members.length === 0) return null;
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="px-2 pb-2 text-2xs font-semibold tracking-wider text-muted uppercase">
        {title}
      </h3>
      <ul className="flex flex-col gap-0.5">
        {members.map(({ person, role, online }) => (
          <li
            key={person.id}
            className={cn("flex items-center gap-3 rounded-md px-2 py-1.5", dimmed && "opacity-55")}
          >
            <Avatar initials={person.initials} tone={person.tone} image={person.image} size="md" online={!dimmed && online} />
            <span className="min-w-0 flex-1 truncate text-md">{person.name}</span>
            {role !== "member" ? <Tag>{role}</Tag> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

type MembersPanelProps = {
  admins: MemberView[];
  online: MemberView[];
  offline: MemberView[];
  onlineCount: number;
  offlineCount: number;
};

export function MembersPanel({ admins, online, offline, onlineCount, offlineCount }: MembersPanelProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <MemberGroup id="members-admins" title="Admins" members={admins} />
      <MemberGroup id="members-online" title={`Online — ${onlineCount}`} members={online} />
      <MemberGroup id="members-offline" title={`Offline — ${offlineCount}`} members={offline} dimmed />
    </div>
  );
}
