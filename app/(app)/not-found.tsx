import { SearchIcon } from "@/components/icons/search-icon";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";

export default function AppNotFound() {
  return (
    <main id="main" className="grid flex-1 place-items-center">
      <EmptyState
        icon={<SearchIcon size={24} />}
        title="Nothing here"
        description="This conversation or room does not exist, or you no longer have access to it."
      >
        <ButtonLink href="/chats">Back to chats</ButtonLink>
      </EmptyState>
    </main>
  );
}
