export type EntityType = 'person' | 'category';

export interface Entity {
  id: string;
  slug: string;
  name: string;
  type: EntityType;
  heatIndex: number; // 0-100
  trend: number; // Percentage change over 24h
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  stockSymbol?: string; // e.g. "TSLA"
}

export interface DynamicUpdate {
  id: string;
  entityId: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  url: string;
}

export interface TrendPoint {
  date: string;
  value: number;
}

// --- MEMBERSHIP SYSTEM TYPES ---

export type UserRole = 'free' | 'trial' | 'paid';
export type UserPlan = 'none' | 'basic' | 'pro';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  trialStartAt: Date | null;
  trialEndAt: Date | null; // Strictly 48 hours from start
  aiUsageToday: number;
  aiUsageTotal: number;
  lastUsageDate: string | null; // ISO Date string YYYY-MM-DD for daily reset
  createdAt: Date;
}
