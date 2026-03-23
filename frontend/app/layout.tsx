import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple and elegant todo application",
};

/**
 * Root layout component for the Next.js application.
 * Wraps all pages with common providers and layout elements.
 *
 * @param children - Child components to render within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} transition-colors duration-200`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
