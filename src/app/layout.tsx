import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/providers/storeProvider";

const roboto = Roboto({
  variable: "--font-robotro",
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
    <html lang="uk">
      <body className={`${roboto.className}}`}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
