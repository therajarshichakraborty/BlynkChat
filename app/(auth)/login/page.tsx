import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Relay to pick up your conversations where you left off.",
};

type LoginPageProps = {
  searchParams: Promise<{ reset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reset } = await searchParams;

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to pick up your conversations."
      footer={
        <>
          New to Relay?{" "}
          <Link href="/signup" className="font-medium text-accent-text hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {reset ? (
        <p role="status" className="mb-5 rounded-md bg-success-soft px-3 py-2.5 text-sm text-success-text">
          Your password was updated. Log in with your new password.
        </p>
      ) : null}
      <LoginForm />
    </AuthCard>
  );
}
