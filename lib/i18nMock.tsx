'use client';

import React from 'react';
import { useAppContext, Locale } from '@/components/AppProvider';

export { AppProvider, useAppContext } from '@/components/AppProvider';

// Translation Data
const messages = {
  en: {
    nav: {
      home: "Dashboard",
      insights: "Insights",
      enterprise: "Enterprise",
      login: "Login"
    },
    home: {
      hero: {
        title: "Real-Time Influence Tracker",
        subtitle: "Quantifying digital impact for investors and brands."
      },
      stats: {
        heatIndex: "Heat Index",
        trend: "24h Trend",
        ranking: "Global Ranking"
      },
      signals: {
        title: "Today's Signals",
        upgrade: "Upgrade for AI Analysis",
        teaser: "Musk satellite mention may lift auto stocks – Upgrade for full insight."
      },
      dynamics: {
        title: "Live Dynamics",
        viewAll: "View All"
      }
    },
    common: {
      loading: "Initializing Neural Link...",
      updated: "Last Updated",
      positive: "Positive",
      negative: "Negative",
      neutral: "Neutral"
    },
    entity: {
      heat: "Heat Index",
      trend: "Trend (24h)",
      news: "Latest Signals",
      back: "Back to Dashboard"
    }
  },
  zh: {
    nav: {
      home: "控制台",
      insights: "深度洞察",
      enterprise: "企业版",
      login: "登录"
    },
    home: {
      hero: {
        title: "实时影响力追踪系统",
        subtitle: "为投资者和品牌量化数字影响力与市场情绪。"
      },
      stats: {
        heatIndex: "热度指数",
        trend: "24小时趋势",
        ranking: "全球排名"
      },
      signals: {
        title: "今日投资信号",
        upgrade: "解锁AI分析",
        teaser: "马斯克关于卫星的言论可能提振汽车股 —— 升级以获取完整报告。"
      },
      dynamics: {
        title: "实时动态",
        viewAll: "查看全部"
      }
    },
    common: {
      loading: "正在初始化神经链接...",
      updated: "最后更新",
      positive: "利好",
      negative: "利空",
      neutral: "中性"
    },
    entity: {
      heat: "热度指数",
      trend: "趋势 (24h)",
      news: "最新信号",
      back: "返回控制台"
    }
  }
};

// Context logic moved to components/AppProvider.tsx
// to ensure Client Component boundary is respected

// Hook mocks
export function useTranslations(namespace: string) {
  const { locale } = useAppContext();
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  
  return (key: string) => {
    const fullPath = `${namespace}.${key}`;
    let val = getNestedValue(messages[locale], fullPath);
    // Fallback logic
    if (!val && namespace === 'common') {
       val = getNestedValue(messages[locale], `common.${key}`);
    }
    return val || key;
  };
}

export function useLocale() {
  const { locale } = useAppContext();
  return locale;
}

export function usePathname() {
  const { pathname } = useAppContext();
  return pathname;
}

export function useRouter() {
  const { setPathname, setLocale } = useAppContext();
  return {
    push: (path: string) => {
      setPathname(path);
      window.scrollTo(0, 0);
    },
    replace: (path: string, options?: { locale: Locale }) => {
       if (options?.locale) setLocale(options.locale);
       setPathname(path);
    }
  };
}

// Component Mocks
export function Link({ href, children, className }: any) {
  const { setPathname } = useAppContext();
  return (
    <a 
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        setPathname(href);
        window.scrollTo(0, 0);
      }}
    >
      {children}
    </a>
  );
}