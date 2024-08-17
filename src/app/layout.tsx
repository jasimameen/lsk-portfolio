import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CustomToaster } from "./utils/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jasim Lsk",
  description: "Software Engineer from 17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <CustomToaster />
      </body>
    </html>
  );
}
