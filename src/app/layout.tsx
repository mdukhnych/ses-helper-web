import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"
import StoreProvider from "@/providers/StoreProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AuthProvider from "@/providers/AuthProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["cyrillic", "latin"],
})

export const metadata: Metadata = {
  title: "SES-Helper",
  description: "SES-Helper app by Mykola Dukhnych",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning >
      <body className={`${roboto.className}`}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <StoreProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
