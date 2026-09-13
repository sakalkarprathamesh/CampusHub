import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DatabaseStatusBanner } from "@/components/layout/DatabaseStatusBanner";

import { getDatabaseStatus } from "@/lib/data";

export const metadata: Metadata = {
  title: "CampusHub — Connect. Collaborate. Create.",
  description:
    "Centralized college club and student organization directory platform for MIT-ADT University.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dbStatus = await getDatabaseStatus();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <DatabaseStatusBanner status={dbStatus} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
