import { useState, useEffect, useCallback, useMemo } from 'react';
import { SubscriptionService } from '../services/subscriptionService';
import {
  UserSubscription,
  SubscriptionPlanConfig,
  FeaturedListingPackage,
} from '../types/subscription';
import { useAuth } from './useAuth';

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanConfig[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<FeaturedListingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated || !user) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [subData, plansData] = await Promise.all([
        SubscriptionService.getCurrentSubscription().catch((err) => {
          console.warn('[useSubscription] getCurrentSubscription fallback:', err.message);
          return null;
        }),
        SubscriptionService.getSubscriptionPlans().catch((err) => {
          console.warn('[useSubscription] getSubscriptionPlans fallback:', err.message);
          return { plans: [], featuredPackages: [] };
        }),
      ]);

      if (subData) {
        setSubscription(subData);
      }
      if (plansData) {
        setPlans(plansData.plans || []);
        setFeaturedPackages(plansData.featuredPackages || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load subscription information');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const refresh = useCallback(() => fetchSubscriptionData(true), [fetchSubscriptionData]);

  const cancel = useCallback(async () => {
    try {
      const updated = await SubscriptionService.cancelSubscription();
      setSubscription(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to cancel subscription');
    }
  }, []);

  const applyFeaturedSlot = useCallback(async (listingId: string) => {
    try {
      await SubscriptionService.applyFeaturedSlot(listingId);
      await fetchSubscriptionData(true);
      return true;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to apply featured listing slot');
    }
  }, [fetchSubscriptionData]);

  // Derived Entitlement Helpers
  const canCreateListing = useMemo(() => {
    if (!subscription) return true; // Default allow, server will gate
    return subscription.usage.activeListingsCount < subscription.limits.maxListings;
  }, [subscription]);

  const canCreateBrand = useMemo(() => {
    if (!subscription) return true;
    return subscription.usage.activeBrandsCount < subscription.limits.maxBrands;
  }, [subscription]);

  const remainingFeaturedSlots = useMemo(() => {
    if (!subscription) return 0;
    return Math.max(
      0,
      subscription.limits.featuredListingSlots - (subscription.usage.featuredSlotsUsed || 0)
    );
  }, [subscription]);

  return {
    subscription,
    plans,
    featuredPackages,
    isLoading,
    isRefreshing,
    error,
    refresh,
    cancel,
    applyFeaturedSlot,
    canCreateListing,
    canCreateBrand,
    remainingFeaturedSlots,
  };
}
