import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a free Relay account for chats, groups and communities.",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Free forever for chats, groups and communities."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent-text hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
