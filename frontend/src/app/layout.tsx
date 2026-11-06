import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import AiChatbot from "@/components/AiChatbot";

export const metadata: Metadata = {
  title: "FranchiseBridge | Franchise Development & Expansion Brokerage Platform",
  description:
    "Assisting proven local brands in packaging SOPs, legal Franchise Disclosure Documents (FDDs), and recruiting multi-unit franchisee investors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen bg-slate-50 antialiased selection:bg-amber-400 selection:text-slate-950">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AiChatbot />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
