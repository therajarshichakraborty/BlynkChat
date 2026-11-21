import type { Metadata } from "next";
import { CreateGroupWizard } from "@/components/group/create-group-wizard";
import { getContacts } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Create a group",
  description: "Create a new Relay group with up to 1,024 members.",
};

export default function CreateGroupPage() {
  return (
    <main id="main" className="flex flex-1 items-start justify-center overflow-y-auto bg-surface md:items-center md:p-8">
      <section
        aria-labelledby="create-group-title"
        className="w-full max-w-200 overflow-hidden border-line bg-card md:rounded-[24px] md:border md:shadow-lg"
      >
        <CreateGroupWizard contacts={getContacts()} mode="page" />
      </section>
    </main>
  );
}
