'use client';

import { useLocale, useRouter, usePathname } from '@/lib/i18nMock';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // useTransition is a real React hook, we can keep it
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-neon/30 bg-cyber-panel backdrop-blur-md text-cyber-neon hover:bg-cyber-neon/10 transition-all text-sm font-mono tracking-wider"
    >
      <span className={locale === 'en' ? 'font-bold' : 'opacity-50'}>EN</span>
      <span className="opacity-50">/</span>
      <span className={locale === 'zh' ? 'font-bold' : 'opacity-50'}>中文</span>
    </button>
  );
}