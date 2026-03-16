import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PriceCompare – Finn de beste matvareprisene",
  description: "Sammenlign matvarepriser fra flere butikker og få varsel når prisene faller",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
