import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // 这里填你支持的语言
  locales: ['en', 'zh'],
  defaultLocale: 'en'
});

// 核心：必须导出这四个变量，且函数名必须是 createNavigation
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
