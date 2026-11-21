import type { Metadata } from "next";
import { LogOutIcon } from "@/components/icons/log-out-icon";
import { ProfileForm } from "@/components/settings/profile-form";
import { SettingsSection } from "@/components/settings/settings-section";
import { ThemePicker } from "@/components/settings/theme-picker";
import { ToggleRow } from "@/components/settings/toggle-row";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button-link";
import { getCurrentUser } from "@/lib/data/users";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Relay profile, theme, notifications and privacy.",
};

export default async function SettingsPage() {
  await requireUser();
  const user = getCurrentUser();

  return (
    <main id="main" className="min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-base text-muted">Manage how you appear and how Relay works for you.</p>
        </header>
        <SettingsSection id="settings-profile" title="Profile" description="This is how people see you in chats and communities.">
          <div className="flex items-center gap-4 border-b border-line py-4">
            <Avatar initials={user.initials} tone={user.tone} size="xl" online />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{user.name}</p>
              <p className="truncate text-sm text-muted">
                @{user.username} · {user.title}
              </p>
            </div>
          </div>
          <ProfileForm
            name={user.name}
            username={user.username}
            bio={`${user.title} in ${user.location}. Building calm software.`}
          />
        </SettingsSection>
        <SettingsSection id="settings-theme" title="Appearance" description="Pick a theme or follow your system setting.">
          <ThemePicker />
        </SettingsSection>
        <SettingsSection id="settings-notifications" title="Notifications" description="Choose what deserves your attention.">
          <ul>
            <ToggleRow label="Direct messages" description="Notify me about new messages in 1:1 chats." defaultChecked />
            <ToggleRow label="Groups" description="Notify me about new messages in groups." defaultChecked />
            <ToggleRow label="Mentions only in communities" description="Only notify me when someone mentions me in a room." defaultChecked />
            <ToggleRow label="Sounds" description="Play a sound for incoming messages." />
          </ul>
        </SettingsSection>
        <SettingsSection id="settings-privacy" title="Privacy" description="Control what others can see. Messages are always end-to-end encrypted.">
          <ul>
            <ToggleRow label="Read receipts" description="Let people see when you have read their messages." defaultChecked />
            <ToggleRow label="Online status" description="Show when you are online." defaultChecked />
            <ToggleRow label="Typing indicator" description="Show when you are typing." defaultChecked />
            <ToggleRow label="Approve group invites" description="Ask me before someone adds me to a group." />
          </ul>
        </SettingsSection>
        <div className="flex justify-end">
          <ButtonLink href="/" variant="outline">
            <LogOutIcon size={17} />
            Log out
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
