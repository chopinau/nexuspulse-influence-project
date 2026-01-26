import { User } from '../types';

/**
 * PERMISSION SYSTEM
 * Enforces access based on roles and trial status.
 */

// Core check: Is the user effectively paid or valid trial?
function hasActivePrivileges(user: User): boolean {
  if (user.role === 'paid') return true;
  
  if (user.role === 'trial') {
    // Fail-safe check: permissions should be checked AFTER the API route handles downgrade,
    // but we check time here again for strictness.
    if (user.trialEndAt && new Date() < user.trialEndAt) {
      return true;
    }
  }
  
  return false;
}

export function canAccessSummary(user: User): boolean {
  return hasActivePrivileges(user);
}

export function canAccessExtendedTrends(user: User): boolean {
  return hasActivePrivileges(user);
}

export function canAccessAIInsight(user: User): boolean {
  // Free users: No access
  // Trial users: Yes, but subject to rate limits handled in API
  // Paid users: Yes
  return hasActivePrivileges(user);
}

// Limit Config
export const AI_USAGE_LIMITS = {
  free: 0,
  trial: 3, // Strict limit for trial
  paid: 100, // Higher limit for paid
};

export function getRemainingUsage(user: User): number {
  if (user.role === 'free') return 0;
  
  const limit = user.role === 'trial' ? AI_USAGE_LIMITS.trial : AI_USAGE_LIMITS.paid;
  return Math.max(0, limit - user.aiUsageToday);
}
