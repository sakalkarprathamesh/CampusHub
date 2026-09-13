import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DatabaseStatusBanner } from "@/components/layout/DatabaseStatusBanner";

export const metadata: Metadata = {
  title: "CampusHub — Connect. Collaborate. Create.",
  description:
    "Centralized college club and student organization directory platform for MIT-ADT University.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <DatabaseStatusBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
