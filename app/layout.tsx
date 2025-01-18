import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RainbowProvider from '@/utils/rainbow/rainbowKit';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Black Pepe Admin",
  description: "Admin dashbaord for black pepe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <RainbowProvider>
        {children}
      </RainbowProvider>
        </body>
    </html>
  );
}
