import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import { Analytics } from "@vercel/analytics/next";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poll-y — Live Polling Made Simple",
  description: "Create polls, settle debates, and discover what the crowd thinks. Real-time voting for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070709]`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 pb-20 md:pb-0">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
