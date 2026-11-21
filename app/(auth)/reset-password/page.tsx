import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { FormAlert } from "@/components/auth/form-alert";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Relay account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, error } = await searchParams;
  const valid = Boolean(token) && !error;

  return (
    <AuthCard
      title="Set a new password"
      description="Pick something you have not used before."
      footer={
        <>
          Back to{" "}
          <Link href="/login" className="font-medium text-accent-text hover:underline">
            log in
          </Link>
        </>
      }
    >
      {valid && token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex flex-col gap-5">
          <FormAlert message="This reset link is invalid or has expired." />
          <ButtonLink href="/forgot-password" size="lg" block>
            Request a new link
          </ButtonLink>
        </div>
      )}
    </AuthCard>
  );
}
