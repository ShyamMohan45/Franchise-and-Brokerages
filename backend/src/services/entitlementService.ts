import mongoose, { Types } from 'mongoose';
import { Subscription, ISubscription, SubscriptionPlanId } from '../models/Subscription';
import { PlatformSettings, DEFAULT_SUBSCRIPTION_PLANS, ISubscriptionPlanConfig } from '../models/PlatformSettings';
import { FranchiseListing } from '../models/FranchiseListing';
import { BusinessProfile } from '../models/BusinessProfile';
import { Lead } from '../models/Lead';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  maxLimit?: number;
  planId?: string;
}

export class EntitlementService {
  /**
   * Helper to fetch platform plan configurations from DB with fallback to defaults
   */
  public static async getPlanConfig(planId: string): Promise<ISubscriptionPlanConfig> {
    let settings: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        settings = await PlatformSettings.findOne();
      } catch {
        settings = null;
      }
    }
    const plans = settings?.subscriptionPlans?.length ? settings.subscriptionPlans : DEFAULT_SUBSCRIPTION_PLANS;
    const plan = plans.find((p: any) => p.id === planId);
    if (plan) return plan;
    // Fallback to free plan if not matched
    return DEFAULT_SUBSCRIPTION_PLANS.find((p) => p.id === 'free') || DEFAULT_SUBSCRIPTION_PLANS[0];
  }

  /**
   * Get or initialize a franchisor subscription.
   * If a user doesn't have an active subscription record, a default 'free' plan is provisioned.
   */
  public static async getOrCreateFranchisorSubscription(userId: string | Types.ObjectId): Promise<ISubscription> {
    let sub = await Subscription.findOne({
      user: userId,
      planType: 'franchisor',
      status: { $in: ['active', 'trial'] },
    });

    if (sub) {
      // Check expiration
      if (sub.currentPeriodEnd && new Date() > sub.currentPeriodEnd) {
        sub.status = 'expired';
        await sub.save();
      } else {
        return sub;
      }
    }

    // Provision default Free plan (lifetime/continuous until upgrade)
    const freeConfig = await this.getPlanConfig('free');
    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 10); // Free tier is persistent

    sub = await Subscription.findOneAndUpdate(
      { user: userId, planType: 'franchisor' },
      {
        user: userId,
        planId: 'free',
        planName: freeConfig.name,
        planType: 'franchisor',
        status: 'active',
        billingInterval: 'monthly',
        price: 0,
        pricePaise: 0,
        currency: 'INR',
        currentPeriodStart: now,
        currentPeriodEnd: nextYear,
        limits: {
          maxBrands: freeConfig.maxBrands,
          maxListings: freeConfig.maxListings,
          monthlyLeadsLimit: freeConfig.monthlyLeadsLimit,
          featuredListingSlots: freeConfig.featuredListingSlots,
          analyticsTier: freeConfig.analyticsTier,
          hasAdvancedFilters: false,
          hasSavedSearches: false,
          hasFddInsights: false,
        },
        usage: {
          activeBrands: 0,
          activeListings: 0,
          leadsThisMonth: 0,
          featuredListingsUsed: 0,
        },
        paymentMethod: 'none',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return sub as ISubscription;
  }

  /**
   * Get or initialize an investor subscription.
   */
  public static async getOrCreateInvestorSubscription(userId: string | Types.ObjectId): Promise<ISubscription> {
    let sub = await Subscription.findOne({
      user: userId,
      planType: 'investor',
      status: { $in: ['active', 'trial'] },
    });

    if (sub) {
      if (sub.currentPeriodEnd && new Date() > sub.currentPeriodEnd) {
        sub.status = 'expired';
        await sub.save();
      } else {
        return sub;
      }
    }

    // Default free investor
    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 10);

    sub = await Subscription.findOneAndUpdate(
      { user: userId, planType: 'investor' },
      {
        user: userId,
        planId: 'free',
        planName: 'Free Investor',
        planType: 'investor',
        status: 'active',
        billingInterval: 'monthly',
        price: 0,
        pricePaise: 0,
        currency: 'INR',
        currentPeriodStart: now,
        currentPeriodEnd: nextYear,
        limits: {
          maxBrands: 0,
          maxListings: 0,
          monthlyLeadsLimit: 999,
          featuredListingSlots: 0,
          analyticsTier: 'basic',
          hasAdvancedFilters: false,
          hasSavedSearches: false,
          hasFddInsights: false,
        },
        usage: {
          activeBrands: 0,
          activeListings: 0,
          leadsThisMonth: 0,
          featuredListingsUsed: 0,
        },
        paymentMethod: 'none',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return sub as ISubscription;
  }

  /**
   * Backend check: Can this franchisor create an additional Brand Profile?
   */
  public static async canCreateBrand(userId: string | Types.ObjectId): Promise<EntitlementCheckResult> {
    const sub = await this.getOrCreateFranchisorSubscription(userId);
    const brandCount = await BusinessProfile.countDocuments({ user: userId });

    if (brandCount >= sub.limits.maxBrands) {
      return {
        allowed: false,
        reason: `Your current ${sub.planName} allows a maximum of ${sub.limits.maxBrands} brand profile(s). Upgrade to Basic, Professional, or Enterprise to publish additional brands.`,
        currentCount: brandCount,
        maxLimit: sub.limits.maxBrands,
        planId: sub.planId,
      };
    }

    return { allowed: true, currentCount: brandCount, maxLimit: sub.limits.maxBrands, planId: sub.planId };
  }

  /**
   * Backend check: Can this franchisor publish an additional Franchise Listing?
   */
  public static async canCreateListing(userId: string | Types.ObjectId): Promise<EntitlementCheckResult> {
    const sub = await this.getOrCreateFranchisorSubscription(userId);
    const listingCount = await FranchiseListing.countDocuments({
      ownerUser: userId,
      status: { $in: ['published', 'PUBLISHED', 'under_review', 'SUBMITTED', 'pending_approval'] },
    });

    if (listingCount >= sub.limits.maxListings) {
      return {
        allowed: false,
        reason: `Your current ${sub.planName} allows a maximum of ${sub.limits.maxListings} active franchise listing(s). You currently have ${listingCount} active or submitted opportunities. Please upgrade your plan to expand your listing capacity.`,
        currentCount: listingCount,
        maxLimit: sub.limits.maxListings,
        planId: sub.planId,
      };
    }

    return { allowed: true, currentCount: listingCount, maxLimit: sub.limits.maxListings, planId: sub.planId };
  }

  /**
   * Backend check: Can this franchisor accept/receive new inquiries this month?
   */
  public static async canAcceptLead(userId: string | Types.ObjectId): Promise<EntitlementCheckResult> {
    const sub = await this.getOrCreateFranchisorSubscription(userId);

    // Calculate leads received in the current calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const leadsCount = await Lead.countDocuments({
      assignedBroker: userId,
      createdAt: { $gte: startOfMonth },
    });

    if (leadsCount >= sub.limits.monthlyLeadsLimit) {
      return {
        allowed: false,
        reason: `Monthly lead inquiry capacity reached (${leadsCount}/${sub.limits.monthlyLeadsLimit} leads for ${sub.planName}). Upgrade your subscription plan for higher investor volume.`,
        currentCount: leadsCount,
        maxLimit: sub.limits.monthlyLeadsLimit,
        planId: sub.planId,
      };
    }

    return { allowed: true, currentCount: leadsCount, maxLimit: sub.limits.monthlyLeadsLimit, planId: sub.planId };
  }

  /**
   * Backend check: Can this franchisor apply a featured listing slot from their subscription?
   */
  public static async canApplyFeaturedSlotFromSubscription(
    userId: string | Types.ObjectId
  ): Promise<EntitlementCheckResult> {
    const sub = await this.getOrCreateFranchisorSubscription(userId);

    if (sub.limits.featuredListingSlots <= 0) {
      return {
        allowed: false,
        reason: `Your ${sub.planName} does not include recurring featured listing slots. Upgrade to Professional (1 slot) or Enterprise (3 slots), or purchase an individual 14, 30, or 90-day featured package.`,
        currentCount: 0,
        maxLimit: 0,
        planId: sub.planId,
      };
    }

    // Count currently active featured listings for this user
    const now = new Date();
    const activeFeaturedCount = await FranchiseListing.countDocuments({
      ownerUser: userId,
      isFeatured: true,
      $or: [{ featuredUntil: { $exists: false } }, { featuredUntil: { $gt: now } }],
    });

    if (activeFeaturedCount >= sub.limits.featuredListingSlots) {
      return {
        allowed: false,
        reason: `All ${sub.limits.featuredListingSlots} featured slots in your ${sub.planName} are currently active on other listings.`,
        currentCount: activeFeaturedCount,
        maxLimit: sub.limits.featuredListingSlots,
        planId: sub.planId,
      };
    }

    return {
      allowed: true,
      currentCount: activeFeaturedCount,
      maxLimit: sub.limits.featuredListingSlots,
      planId: sub.planId,
    };
  }

  /**
   * Backend check: Does an investor have access to premium discovery filters?
   */
  public static async canInvestorUseAdvancedFilters(userId: string | Types.ObjectId): Promise<boolean> {
    const sub = await this.getOrCreateInvestorSubscription(userId);
    return Boolean(sub.planId === 'investor_premium' && sub.status === 'active');
  }

  /**
   * Update usage counters on a franchisor subscription
   */
  public static async refreshFranchisorUsage(userId: string | Types.ObjectId): Promise<void> {
    const sub = await this.getOrCreateFranchisorSubscription(userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeBrands, activeListings, leadsThisMonth, featuredListingsUsed] = await Promise.all([
      BusinessProfile.countDocuments({ user: userId }),
      FranchiseListing.countDocuments({
        ownerUser: userId,
        status: { $in: ['published', 'PUBLISHED'] },
      }),
      Lead.countDocuments({
        assignedBroker: userId,
        createdAt: { $gte: startOfMonth },
      }),
      FranchiseListing.countDocuments({
        ownerUser: userId,
        isFeatured: true,
        $or: [{ featuredUntil: { $exists: false } }, { featuredUntil: { $gt: now } }],
      }),
    ]);

    sub.usage = {
      activeBrands,
      activeListings,
      leadsThisMonth,
      featuredListingsUsed,
    };

    await sub.save();
  }
}
