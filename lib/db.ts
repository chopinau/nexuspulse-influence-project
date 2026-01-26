import { User } from '../types';

/**
 * MOCK DATABASE
 * In a real app, replace this with Prisma/Postgres logic.
 */

// Helper to calculate 48h from now (negative hours for expired)
const hoursFromNow = (h: number) => {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d;
};

// Seed Data
const mockUsers: User[] = [
  {
    id: 'user_free',
    email: 'free@example.com',
    role: 'free',
    plan: 'none',
    trialStartAt: null,
    trialEndAt: null,
    aiUsageToday: 0,
    aiUsageTotal: 10,
    lastUsageDate: new Date().toISOString().split('T')[0],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user_trial_active',
    email: 'trial@example.com',
    role: 'trial',
    plan: 'basic',
    trialStartAt: hoursFromNow(-1), // Started 1 hour ago
    trialEndAt: hoursFromNow(47),   // Ends in 47 hours
    aiUsageToday: 1,
    aiUsageTotal: 5,
    lastUsageDate: new Date().toISOString().split('T')[0],
    createdAt: hoursFromNow(-1)
  },
  {
    id: 'user_trial_expired',
    email: 'expired@example.com',
    role: 'trial', // Logic will auto-downgrade this on access
    plan: 'basic',
    trialStartAt: hoursFromNow(-50), // Started 50 hours ago
    trialEndAt: hoursFromNow(-2),    // Ended 2 hours ago
    aiUsageToday: 0,
    aiUsageTotal: 20,
    lastUsageDate: new Date().toISOString().split('T')[0],
    createdAt: hoursFromNow(-50)
  },
  {
    id: 'user_paid',
    email: 'paid@example.com',
    role: 'paid',
    plan: 'pro',
    trialStartAt: null,
    trialEndAt: null,
    aiUsageToday: 15,
    aiUsageTotal: 500,
    lastUsageDate: new Date().toISOString().split('T')[0],
    createdAt: new Date('2024-01-01')
  }
];

export const db = {
  user: {
    findUnique: async (id: string): Promise<User | null> => {
      // Simulate db latency
      // await new Promise(resolve => setTimeout(resolve, 10)); 
      return mockUsers.find(u => u.id === id) || null;
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      const updatedUser = { ...mockUsers[index], ...data };
      mockUsers[index] = updatedUser;
      return updatedUser;
    },

    // Registration helper
    create: async (email: string): Promise<User> => {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000); // +48 hours
      
      const newUser: User = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        role: 'trial', // AUTO-TRIAL Rule
        plan: 'basic',
        trialStartAt: now,
        trialEndAt: trialEnd,
        aiUsageToday: 0,
        aiUsageTotal: 0,
        lastUsageDate: now.toISOString().split('T')[0],
        createdAt: now
      };
      
      mockUsers.push(newUser);
      return newUser;
    }
  }
};
