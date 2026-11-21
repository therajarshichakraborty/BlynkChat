import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Relay to pick up your conversations where you left off.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to pick up your conversations."
      footer={
        <>
          New to Relay?{" "}
          <Link href="/" className="font-medium text-accent-text hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
