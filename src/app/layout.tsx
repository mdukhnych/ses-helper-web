import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/providers/StoreProvider";
import { ThemeProvider } from "next-themes";
import AuthProvider from "@/providers/AuthProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["cyrillic", "latin"],
});

export const metadata: Metadata = {
  title: "SES Helper",
  description: "SES helper web app by Mykola Dukhnych",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`${roboto.className}}`}>
          <StoreProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem={true}
              disableTransitionOnChange={true}
            >
              <AuthProvider>
                {children}
              </AuthProvider>
            </ThemeProvider>
          </StoreProvider>
      </body>
    </html>
  );
}
