import { Platform } from 'react-native';
import {
  RazorpayCheckoutOptions,
  RazorpaySuccessData,
  RazorpayErrorData,
} from '../types/payment';

// Attempt to load official react-native-razorpay native module
let NativeRazorpay: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RazorpayModule = require('react-native-razorpay');
  NativeRazorpay = RazorpayModule.default || RazorpayModule;
} catch (e) {
  NativeRazorpay = null;
}

export class RazorpayCheckoutService {
  /**
   * Check if the official Razorpay native module is available in this runtime.
   * Returns true in Expo Development Builds (prebuild) on iOS and Android.
   * Returns false in standard Expo Go or Web environments.
   */
  public static isNativeAvailable(): boolean {
    if (Platform.OS === 'web') return false;
    if (!NativeRazorpay) return false;
    try {
      return typeof NativeRazorpay.open === 'function';
    } catch {
      return false;
    }
  }

  /**
   * Open official Razorpay Native Standard Checkout dialog.
   * Rejects if user cancels or payment gateway encounters an error.
   */
  public static async openNative(
    options: RazorpayCheckoutOptions
  ): Promise<RazorpaySuccessData> {
    if (!this.isNativeAvailable()) {
      throw new Error(
        'Razorpay native module is unavailable in this runtime. Running inside Expo Go requires an Expo Development Build or WebView fallback.'
      );
    }

    return new Promise<RazorpaySuccessData>((resolve, reject) => {
      try {
        NativeRazorpay.open(
          options,
          (successData: RazorpaySuccessData) => {
            if (!successData || !successData.razorpay_payment_id) {
              reject(new Error('Invalid payment success response from native checkout.'));
              return;
            }
            resolve(successData);
          },
          (errorData: RazorpayErrorData) => {
            const description =
              errorData?.description ||
              (errorData?.code === 0 ? 'Payment was cancelled by user.' : 'Payment failed.');
            const error = new Error(description) as Error & {
              code?: number;
              cancelled?: boolean;
              raw?: RazorpayErrorData;
            };
            error.code = errorData?.code;
            error.cancelled = errorData?.code === 0 || description.toLowerCase().includes('cancelled');
            error.raw = errorData;
            reject(error);
          }
        );
      } catch (err: any) {
        reject(
          new Error(
            err?.message || 'Unexpected exception invoking Razorpay native checkout.'
          )
        );
      }
    });
  }
}
