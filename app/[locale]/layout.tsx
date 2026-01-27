import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Navbar from "@/components/Navbar";
import "@/app/globals.css";
// Ensure globals.css is loaded for Vercel deployment
import { ReactNode } from "react";

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
    <html lang={locale} className="dark">
      {/* Load Noto Sans SC for Chinese support if needed */}
      <body className={`${inter.className} ${locale === 'zh' ? notoSansSC.className : ''} bg-cyber-dark text-slate-100 min-h-screen selection:bg-cyber-neon selection:text-cyber-dark overflow-x-hidden`}>
        <div className="fixed inset-0 bg-radiant-dark -z-20" />
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10 mix-blend-overlay" />
        
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}