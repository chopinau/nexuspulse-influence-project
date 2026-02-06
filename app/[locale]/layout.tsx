import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AppProvider } from '@/components/AppProvider';
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});
const notoSansSC = Noto_Sans_SC({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-noto-sc"
});

export const metadata: Metadata = {
  title: "NexusPulse",
  description: "Cyberpunk Influence Tracker",
};

import AppShell from "@/components/AppShell"

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
      <body className={cn(
          "min-h-screen bg-slate-950 text-slate-200 font-sans antialiased selection:bg-cyan-500/30",
          locale === 'zh' ? `${inter.variable} ${notoSansSC.variable}` : inter.variable
        )}>
        
        <NextIntlClientProvider messages={messages}>
          <AppProvider>
            <AppShell>
              {children}
            </AppShell>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
