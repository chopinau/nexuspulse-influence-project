import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AppProvider } from '@/components/AppProvider';
// import Navbar from "@/components/Navbar";
// Ensure globals.css is loaded for Vercel deployment
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });
const notoSansSC = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "NexusPulse",
  description: "Cyberpunk Influence Tracker",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      {/* Load Noto Sans SC for Chinese support if needed */}
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className,
          locale === 'zh' && notoSansSC.className
        )}>
        
        <NextIntlClientProvider messages={messages}>
          <AppProvider>
            {/* <Navbar /> */}
            <main className="min-h-screen">
              {children}
            </main>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}