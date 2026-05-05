import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/app/providers";

const bodyFont = Noto_Sans_Thai({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = Noto_Sans_Thai({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "TTB CART E-commerce",
  description: "E-commerce with Next.js, .NET, Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${headingFont.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
