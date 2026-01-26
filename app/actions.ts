'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncUserStatus, USAGE_LIMITS, canUseAI, incrementAIUsage } from "@/lib/membership";
import { GoogleGenAI } from "@google/genai";

export type DashboardData = {
  user: {
    name: string | null;
    email: string | null;
    plan: string;
    trialEndsAt: Date | null;
    usageToday: number;
    usageMonthly: number;
  };
  limits: {
    daily: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    date: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
};

export async function getUserDashboardData(): Promise<DashboardData | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  // Fetch user from DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return null;

  // Sync trial status and daily limits
  const syncedUser = await syncUserStatus(user.id);
  const finalUser = syncedUser || user;

  const planLimit = USAGE_LIMITS[finalUser.plan as keyof typeof USAGE_LIMITS] || 0;

  // Mock activity data since we don't have an Activity model yet
  const mockActivity = [
    { id: '1', title: 'Tesla (TSLA) Sentiment Spike', date: new Date().toISOString(), sentiment: 'positive' as const },
    { id: '2', title: 'Sector Analysis: AI Hardware', date: new Date(Date.now() - 86400000).toISOString(), sentiment: 'neutral' as const },
    { id: '3', title: 'Consumer Discretionary Alert', date: new Date(Date.now() - 172800000).toISOString(), sentiment: 'negative' as const },
  ];

  return {
    user: {
      name: finalUser.name,
      email: finalUser.email,
      plan: finalUser.plan,
      trialEndsAt: finalUser.trialEndsAt,
      usageToday: finalUser.aiUsageCountToday,
      usageMonthly: finalUser.aiUsageCountMonthly,
    },
    limits: {
      daily: planLimit
    },
    recentActivity: mockActivity
  };
}

// --- SECURE AI ACTION ---

export async function generateAIInsight(context: string) {
  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  const userId = session.user.id;

  // 2. Permission & Limit Check (Atomic logic handled in lib/membership.ts)
  // This validates plan, checks trial expiration, and checks daily limits.
  const { allowed, remaining, error } = await canUseAI(userId);

  if (!allowed) {
    // Security: Do not expose internal plan details, just the user-facing error.
    return { error: error || "Usage limit exceeded." };
  }

  // 3. AI Execution
  try {
    let aiResponseText = "";
    
    if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `As a financial analyst, provide a concise 50-word insight on: ${context}`,
        });
        aiResponseText = response.text || "No insight generated.";
    } else {
        // Fallback for dev without API key
        aiResponseText = "[MOCK] AI Insight: Strong bullish divergence detected based on recent volume metrics.";
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate latency
    }

    // 4. Atomic Increment
    // Only increment if AI call was successful.
    await incrementAIUsage(userId);

    return { 
      success: true, 
      data: aiResponseText, 
      remaining: remaining - 1 // Return client-side estimate
    };

  } catch (err) {
    console.error("[AI Action Error]", err);
    return { error: "AI service temporarily unavailable." };
  }
}
