'use client';

import { Link, useTranslations, useRouter } from '@/lib/i18nMock';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const router = useRouter();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-cyber-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyber-neon to-cyber-purple animate-pulse" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter">
              NEXUS<span className="text-cyber-neon">PULSE</span>
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-white hover:text-cyber-neon px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('home')}
              </Link>
              <Link href="/premium" className="text-gray-300 hover:text-cyber-neon px-3 py-2 rounded-md text-sm font-medium transition-colors">
                {t('insights')}
              </Link>
              <div className="text-gray-500 cursor-not-allowed px-3 py-2 text-sm font-medium">
                {t('enterprise')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button className="bg-cyber-neon/10 hover:bg-cyber-neon/20 text-cyber-neon px-4 py-1.5 rounded-lg text-sm font-medium border border-cyber-neon/50 transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]">
              {t('login')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}