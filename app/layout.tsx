import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { StoreProvider } from "@/providers/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import { ModalRenderer } from "@/components/modals/modal-renderer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["cyrillic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["cyrillic", "latin"],
});

export const metadata: Metadata = {
  title: "SES helper",
  description: "SES helper app by Mykola Dukhnych",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-y-scroll`}
      >
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
              <main>{children}</main>
              <ModalRenderer />
              <Toaster />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
