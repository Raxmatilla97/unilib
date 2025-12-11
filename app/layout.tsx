import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Library ID - Intelligent University Library",
  description: "AI-powered digital library for modern education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <QueryProvider>
              <AuthProvider>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col pb-24 md:pb-0">
                    <Header />
                    <main className="flex-1">
                      {children}
                    </main>
                    <FooterWrapper />
                  </div>
                  <MobileNav />
                </div>
                <Toaster position="top-right" closeButton theme="dark" />
              </AuthProvider>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
