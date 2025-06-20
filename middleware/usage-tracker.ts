import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/client";
import { checkUsageLimit, getTierById, type SubscriptionTier } from "@/lib/billing/subscription-tiers";

/* eslint-disable no-undef */
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export type UsageAction =
  | 'genomic_analysis'
  | 'api_call'
  | 'storage_use'
  | 'trial_match'
  | 'ai_recommendation'
  | 'patient_access';

export interface UsageRecord {
  userId: string;
  action: UsageAction;
  amount: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserUsage {
  userId: string;
  tierId: string;
  currentPeriodStart: Date;
  usage: {
    genomicAnalyses: number;
    patientsPerMonth: number;
    apiCalls: number;
    storageGB: number;
    trialMatches: number;
    aiRecommendations: number;
  };
  lastUpdated: Date;
}

class UsageTracker {
  private supabase = createClient();

  async getUserTier(userId: string): Promise<string> {
    const cacheKey = `user_tier:${userId}`;

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached as string;
    }

    // Fetch from database
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('tier_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      // Default to free tier
      return 'free';
    }

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, data.tier_id);

    return data.tier_id;
  }

  async getCurrentUsage(userId: string): Promise<UserUsage> {
    const cacheKey = `user_usage:${userId}`;

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached as UserUsage;
    }

    // Get current billing period start
    const currentPeriodStart = this.getCurrentPeriodStart();

    // Fetch usage from database
    const { data, error } = await this.supabase
      .from('user_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', currentPeriodStart.toISOString())
      .order('created_at', { ascending: false });

    const tierId = await this.getUserTier(userId);

    if (error || !data) {
      // Return empty usage
      const emptyUsage: UserUsage = {
        userId,
        tierId,
        currentPeriodStart,
        usage: {
          genomicAnalyses: 0,
          patientsPerMonth: 0,
          apiCalls: 0,
          storageGB: 0,
          trialMatches: 0,
          aiRecommendations: 0
        },
        lastUpdated: new Date()
      };

      // Cache for 1 minute
      await redis.setex(cacheKey, 60, emptyUsage);
      return emptyUsage;
    }

    // Aggregate usage by action type
    const usage = data.reduce((acc, record) => {
      switch (record.action) {
        case 'genomic_analysis':
          acc.genomicAnalyses += record.amount;
          break;
        case 'patient_access':
          acc.patientsPerMonth += record.amount;
          break;
        case 'api_call':
          acc.apiCalls += record.amount;
          break;
        case 'storage_use':
          acc.storageGB += record.amount;
          break;
        case 'trial_match':
          acc.trialMatches += record.amount;
          break;
        case 'ai_recommendation':
          acc.aiRecommendations += record.amount;
          break;
      }
      return acc;
    }, {
      genomicAnalyses: 0,
      patientsPerMonth: 0,
      apiCalls: 0,
      storageGB: 0,
      trialMatches: 0,
      aiRecommendations: 0
    });

    const userUsage: UserUsage = {
      userId,
      tierId,
      currentPeriodStart,
      usage,
      lastUpdated: new Date()
    };

    // Cache for 1 minute
    await redis.setex(cacheKey, 60, userUsage);

    return userUsage;
  }

  async trackUsage(
    userId: string,
    action: UsageAction,
    amount: number = 1,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string; usage?: UserUsage }> {
    try {
      // Get current usage and tier
      const currentUsage = await this.getCurrentUsage(userId);
      const tier = getTierById(currentUsage.tierId);

      if (!tier) {
        return { success: false, error: 'Invalid subscription tier' };
      }

      // Map action to usage limit key
      const limitKey = this.mapActionToLimitKey(action);
      if (!limitKey) {
        return { success: false, error: 'Invalid action type' };
      }

      // Check if usage would exceed limit
      const limitCheck = checkUsageLimit(
        currentUsage.tierId,
        limitKey,
        currentUsage.usage[limitKey] + amount
      );

      if (!limitCheck.allowed) {
        return {
          success: false,
          error: `Usage limit exceeded. Please upgrade your plan. Current: ${currentUsage.usage[limitKey]}, Limit: ${limitCheck.limit}`
        };
      }

      // Record usage in database
      const { error: dbError } = await this.supabase
        .from('user_usage_tracking')
        .insert({
          user_id: userId,
          action,
          amount,
          metadata,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to record usage:', dbError);
        return { success: false, error: 'Failed to record usage' };
      }

      // Update cached usage
      currentUsage.usage[limitKey] += amount;
      currentUsage.lastUpdated = new Date();

      const cacheKey = `user_usage:${userId}`;
      await redis.setex(cacheKey, 60, currentUsage);

      // Emit usage event for analytics
      this.emitUsageEvent(userId, action, amount, metadata);

      return { success: true, usage: currentUsage };

    } catch (error) {
      console.error('Usage tracking error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkUsageAllowed(
    userId: string,
    action: UsageAction,
    amount: number = 1
  ): Promise<{ allowed: boolean; remaining: number; limit: number; error?: string }> {
    try {
      const currentUsage = await this.getCurrentUsage(userId);
      const limitKey = this.mapActionToLimitKey(action);

      if (!limitKey) {
        return { allowed: false, remaining: 0, limit: 0, error: 'Invalid action type' };
      }

      return checkUsageLimit(
        currentUsage.tierId,
        limitKey,
        currentUsage.usage[limitKey] + amount
      );

    } catch (error) {
      console.error('Usage check error:', error);
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getUserUsageStats(userId: string) {
    const usage = await this.getCurrentUsage(userId);
    const tier = getTierById(usage.tierId);

    if (!tier) {
      return null;
    }

    return {
      tier,
      usage: usage.usage,
      limits: tier.limits,
      utilization: {
        genomicAnalyses: this.calculateUtilization(usage.usage.genomicAnalyses, tier.limits.genomicAnalyses),
        patientsPerMonth: this.calculateUtilization(usage.usage.patientsPerMonth, tier.limits.patientsPerMonth),
        apiCalls: this.calculateUtilization(usage.usage.apiCalls, tier.limits.apiCalls),
        storageGB: this.calculateUtilization(usage.usage.storageGB, tier.limits.storageGB),
        trialMatches: this.calculateUtilization(usage.usage.trialMatches, tier.limits.trialMatches),
        aiRecommendations: this.calculateUtilization(usage.usage.aiRecommendations, tier.limits.aiRecommendations)
      },
      currentPeriodStart: usage.currentPeriodStart,
      nextPeriodStart: this.getNextPeriodStart(usage.currentPeriodStart)
    };
  }

  private mapActionToLimitKey(action: UsageAction): keyof SubscriptionTier['limits'] | null {
    const mapping: Record<UsageAction, keyof SubscriptionTier['limits']>= {
      'genomic_analysis': 'genomicAnalyses',
      'patient_access': 'patientsPerMonth',
      'api_call': 'apiCalls',
      'storage_use': 'storageGB',
      'trial_match': 'trialMatches',
      'ai_recommendation': 'aiRecommendations'
    };

    return mapping[action] || null;
  }

  private calculateUtilization(current: number, limit: number): number {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  }

  private getCurrentPeriodStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
  }

  private getNextPeriodStart(currentPeriodStart: Date): Date {
    const next = new Date(currentPeriodStart);
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  private emitUsageEvent(userId: string, action: UsageAction, amount: number, metadata?: Record<string, any>) {
    // Emit event for analytics/monitoring
    // This could integrate with your analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'usage_tracked', {
        event_category: 'usage',
        event_label: action,
        value: amount,
        custom_parameters: {
          user_id: userId,
          ...metadata
        }
      });
    }
  }
}

// Singleton instance
export const usageTracker = new UsageTracker();

// Convenience functions
export async function trackUsage(
  userId: string,
  action: UsageAction,
  amount: number = 1,
  metadata?: Record<string, any>
) {
  return usageTracker.trackUsage(userId, action, amount, metadata);
}

export async function checkUsageAllowed(
  userId: string,
  action: UsageAction,
  amount: number = 1
) {
  return usageTracker.checkUsageAllowed(userId, action, amount);
}

export async function getUserUsageStats(userId: string) {
  return usageTracker.getUserUsageStats(userId);
}