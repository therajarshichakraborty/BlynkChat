import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "@/app/styles/globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlynkChat",
  description: "Real-Time Chat Application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
