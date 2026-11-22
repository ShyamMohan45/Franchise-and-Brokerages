import { Types } from 'mongoose';
import { FranchiseListing } from '../models/FranchiseListing';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { PaymentService } from './paymentService';

export interface SubscriptionTier {
  id: string;
  name: string;
  monthlyPriceINR: number;
  featuredSlots: number;
  leadsCap: number;
  dealRoomsIncluded: number;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  starter: {
    id: 'starter',
    name: 'Starter Franchisor',
    monthlyPriceINR: 9999,
    featuredSlots: 0,
    leadsCap: 15,
    dealRoomsIncluded: 2,
    features: ['Basic Listing Directory', 'Digital SOP Viewer', 'Standard Application CRM'],
  },
  growth: {
    id: 'growth',
    name: 'Growth Scale',
    monthlyPriceINR: 24999,
    featuredSlots: 1,
    leadsCap: 50,
    dealRoomsIncluded: 10,
    features: [
      '1 Featured Listing Placement',
      'AI Readiness Analyzer',
      'Encrypted Virtual Deal Rooms',
      'Location Intelligence Radar (3 Cities)',
      '13-Pillar Due Diligence Checklists',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Institutional Enterprise',
    monthlyPriceINR: 49999,
    featuredSlots: 3,
    leadsCap: 9999,
    dealRoomsIncluded: 50,
    features: [
      '3 Homepage Featured Slots',
      'Unlimited Virtual Deal Rooms with E-Sign',
      'Dedicated Brokerage Deal Director',
      'Nationwide Catchment Demographic Intel',
      'White-Glove FDD 23-Item Legal Structuring',
    ],
  },
};

export class MonetizationService {
  /**
   * Calculate brokerage commission for a closed franchise transaction
   */
  public static calculateCommission(dealValue: number, commissionRate = 0.05) {
    const rawCommission = dealValue * commissionRate;
    const gstRate = 0.18; // 18% GST in India
    const gstAmount = rawCommission * gstRate;
    const totalPayable = rawCommission + gstAmount;

    return {
      dealValue,
      commissionRate,
      baseCommission: rawCommission,
      gstRate,
      gstAmount,
      totalPayable,
    };
  }

  /**
   * Set a franchise listing as featured
   */
  public static async setFeaturedListing(listingId: string, isFeatured: boolean) {
    return await FranchiseListing.findByIdAndUpdate(
      listingId,
      { isFeatured },
      { new: true }
    );
  }

  /**
   * Record deal brokerage payout settlement
   */
  public static async recordCommissionSettlement(dealId: string, amount: number) {
    return await BrokerageDeal.findByIdAndUpdate(
      dealId,
      {
        actualCommissionEarned: amount,
        paymentStatus: 'paid',
      },
      { new: true }
    );
  }

  /**
   * Modular Payment Provider Dispatcher (Stripe / Razorpay adapter interface)
   */
  public static async createPaymentIntent(params: {
    amountINR: number;
    currency?: string;
    purpose: 'subscription' | 'featured_listing' | 'brokerage_retainer';
    userId: string;
    metadata?: Record<string, any>;
  }) {
    const purposeMap: Record<string, any> = {
      subscription: 'subscription',
      featured_listing: 'featured_listing',
      brokerage_retainer: 'commission',
    };

    return await PaymentService.createOrder({
      userId: params.userId,
      purpose: purposeMap[params.purpose] || 'advisory_service',
      customAmountINR: params.amountINR,
      metadata: params.metadata,
    });
  }
}
