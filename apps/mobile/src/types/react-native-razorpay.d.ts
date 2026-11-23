declare module 'react-native-razorpay' {
  export interface RazorpayCheckoutOptions {
    description?: string;
    image?: string;
    currency: string;
    key: string;
    amount: number | string;
    name: string;
    order_id: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
      backdrop_color?: string;
    };
    notes?: Record<string, any>;
    modal?: {
      ondismiss?: () => void;
      confirm_close?: boolean;
    };
    send_sms_hash?: boolean;
  }

  export interface RazorpaySuccessData {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export interface RazorpayErrorData {
    code: number;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  }

  export default class RazorpayCheckout {
    static open(
      options: RazorpayCheckoutOptions,
      successCallback?: (data: RazorpaySuccessData) => void,
      errorCallback?: (error: RazorpayErrorData) => void
    ): Promise<RazorpaySuccessData>;

    static onExternalWalletSelection(
      callback: (data: { external_wallet: string }) => void
    ): void;
  }
}
