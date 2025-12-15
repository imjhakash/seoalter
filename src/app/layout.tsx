import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEOPataka - AI-Powered SEO Analysis",
  description: "Real-time SEO Intelligence powered by AI. Analyze keywords, track trends, dominate rankings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
