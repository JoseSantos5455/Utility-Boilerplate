import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
import { Providers } from "../components/layouts/Providers";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PLATFORM_TITLE,
  description: process.env.NEXT_PUBLIC_PLATFORM_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
