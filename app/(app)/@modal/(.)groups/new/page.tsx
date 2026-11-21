import type { Metadata } from "next";
import { CreateGroupWizard } from "@/components/group/create-group-wizard";
import { Modal } from "@/components/ui/modal";
import { getContacts } from "@/lib/data/users";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Create a group",
  description: "Create a new Relay group with up to 1,024 members.",
};

export default async function CreateGroupModal() {
  await requireUser();
  return (
    <Modal labelledBy="create-group-title">
      <CreateGroupWizard contacts={getContacts()} mode="modal" />
    </Modal>
  );
}
