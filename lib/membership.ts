import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

// Constants
export const USAGE_LIMITS = {
  FREE: 1,
  TRIAL: 20,
  PAID: 100
};

/**
 * Checks if a user is currently in a valid trial period.
 */
export function isTrialActive(user: Partial<User>): boolean {
  if (user.plan !== "TRIAL" || !user.trialEndsAt) return false;
  return new Date() < new Date(user.trialEndsAt);
}

/**
 * Determines if user effectively has paid-level access (is PAID or Active TRIAL).
 * Handles the logic of downgrading expired trials internally if DB access is available,
 * or returns boolean based on current state.
 */
export function hasPaidAccess(user: Partial<User>): boolean {
  if (user.plan === "PAID") return true;
  return isTrialActive(user);
}

/**
 * CORE LOGIC: Check permissions and enforce database-level updates for expiration.
 * Should be called at the start of protected API routes.
 */
export async function syncUserStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // Check for daily reset
  const now = new Date();
  const lastReset = new Date(user.lastUsageReset);
  if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth()) {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        aiUsageCountToday: 0,
        lastUsageReset: now
      }
    });
    user.aiUsageCountToday = 0; // Update local reference
  }

  // Check Trial Expiration
  if (user.plan === "TRIAL" && user.trialEndsAt && now > user.trialEndsAt) {
    console.log(`[Membership] Trial expired for ${user.id}. Downgrading to FREE.`);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "FREE",
        trialEndsAt: null // Clear trial date
      }
    });
    return updatedUser;
  }

  return user;
}

/**
 * Checks if the user can use AI based on their plan limits.
 */
export async function canUseAI(userId: string): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  const user = await syncUserStatus(userId);
  if (!user) return { allowed: false, remaining: 0, error: "User not found" };

  const limit = USAGE_LIMITS[user.plan as keyof typeof USAGE_LIMITS] || 0;
  const remaining = Math.max(0, limit - user.aiUsageCountToday);

  if (remaining <= 0) {
    return { 
      allowed: false, 
      remaining: 0, 
      error: `Daily limit reached for ${user.plan} plan. Upgrade for more.` 
    };
  }

  return { allowed: true, remaining };
}

/**
 * Increment usage count. Call this AFTER the AI generation succeeds.
 */
export async function incrementAIUsage(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      aiUsageCountToday: { increment: 1 },
      aiUsageCountMonthly: { increment: 1 }
    }
  });
}
