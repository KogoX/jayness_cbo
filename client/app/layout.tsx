import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auth Modal Demo",
  description: "Glassmorphism auth modal with Supabase in Next.js App Router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
