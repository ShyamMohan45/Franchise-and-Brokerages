import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { PaymentService } from '../services/paymentService';
import { RazorpayCheckoutService } from '../services/razorpayCheckoutService';
import {
  CreateOrderParams,
  RazorpayCheckoutOptions,
  RazorpaySuccessData,
  RazorpayErrorData,
  CheckoutResult,
  CheckoutMode,
} from '../types/payment';
import { useAuth } from './useAuth';

export interface UseCheckoutReturn {
  isProcessing: boolean;
  isVerifying: boolean;
  error: string | null;
  checkoutMode: CheckoutMode;
  webViewOptions: RazorpayCheckoutOptions | null;
  isWebViewVisible: boolean;
  startCheckout: (
    params: CreateOrderParams,
    options?: {
      title?: string;
      description?: string;
      billingDetails?: {
        fullName: string;
        email: string;
        phone?: string;
        companyName?: string;
        billingAddress?: string;
        city?: string;
        state?: string;
        country?: string;
        gstin?: string;
      };
    }
  ) => Promise<CheckoutResult>;
  cancelWebView: () => void;
  handleWebViewSuccess: (data: RazorpaySuccessData) => void;
  handleWebViewError: (err: RazorpayErrorData | { description: string }) => void;
}

export function useCheckout(): UseCheckoutReturn {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('native');
  const [webViewOptions, setWebViewOptions] = useState<RazorpayCheckoutOptions | null>(null);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);

  // Active transaction context for pending verification
  const activeTxRef = useRef<{
    transactionReference: string;
    gatewayOrderId: string;
    billingDetails?: any;
    resolve: (result: CheckoutResult) => void;
    reject: (err: any) => void;
  } | null>(null);

  /**
   * Internal routine: Submit cryptographic payment signature to backend verification endpoint
   */
  const executeVerification = useCallback(
    async (
      successData: RazorpaySuccessData,
      txRef: string,
      orderId: string,
      billingDetails?: any
    ): Promise<CheckoutResult> => {
      setIsVerifying(true);
      setError(null);

      try {
        const verification = await PaymentService.verifyPayment({
          transactionReference: txRef,
          gatewayOrderId: successData.razorpay_order_id || orderId,
          gatewayPaymentId: successData.razorpay_payment_id,
          gatewaySignature: successData.razorpay_signature,
          billingDetails,
        });

        setIsProcessing(false);
        setIsVerifying(false);
        return {
          success: true,
          transaction: verification.transaction,
          invoice: verification.invoice,
          details: successData,
        };
      } catch (err: any) {
        setIsProcessing(false);
        setIsVerifying(false);
        const errMsg =
          err?.message ||
          'Cryptographic signature verification failed. Entitlements were not granted.';
        setError(errMsg);
        return {
          success: false,
          error: errMsg,
        };
      }
    },
    []
  );

  /**
   * Handle completion from WebView modal
   */
  const handleWebViewSuccess = useCallback(
    async (data: RazorpaySuccessData) => {
      setIsWebViewVisible(false);
      setWebViewOptions(null);

      if (!activeTxRef.current) return;
      const { transactionReference, gatewayOrderId, billingDetails, resolve } =
        activeTxRef.current;
      activeTxRef.current = null;

      const result = await executeVerification(
        data,
        transactionReference,
        gatewayOrderId,
        billingDetails
      );
      resolve(result);
    },
    [executeVerification]
  );

  const handleWebViewError = useCallback(
    (errData: RazorpayErrorData | { description: string }) => {
      setIsWebViewVisible(false);
      setWebViewOptions(null);
      setIsProcessing(false);

      const desc = errData?.description || 'Payment failed in checkout window.';
      setError(desc);

      if (activeTxRef.current) {
        activeTxRef.current.resolve({
          success: false,
          error: desc,
        });
        activeTxRef.current = null;
      }
    },
    []
  );

  const cancelWebView = useCallback(() => {
    setIsWebViewVisible(false);
    setWebViewOptions(null);
    setIsProcessing(false);

    if (activeTxRef.current) {
      activeTxRef.current.resolve({
        success: false,
        cancelled: true,
        error: 'Payment was cancelled by user.',
      });
      activeTxRef.current = null;
    }
  }, []);

  /**
   * Start Checkout Lifecycle:
   * 1. Create order on server.
   * 2. Inspect order and gateway key configuration.
   * 3. Invoke native Razorpay checkout (or fallback to WebView modal).
   * 4. Verify cryptographic signature on backend.
   * 5. Fulfill entitlements.
   */
  const startCheckout = useCallback(
    async (
      params: CreateOrderParams,
      options?: {
        title?: string;
        description?: string;
        billingDetails?: {
          fullName: string;
          email: string;
          phone?: string;
          companyName?: string;
          billingAddress?: string;
          city?: string;
          state?: string;
          country?: string;
          gstin?: string;
        };
      }
    ): Promise<CheckoutResult> => {
      if (isProcessing) {
        return {
          success: false,
          error: 'A checkout transaction is already in progress.',
        };
      }

      setIsProcessing(true);
      setError(null);

      try {
        // 1. Create server-side order
        const orderData = await PaymentService.createOrder(params);

        if (!orderData || !orderData.orderId) {
          throw new Error('Server returned an invalid payment order configuration.');
        }

        // Check if gateway keys are unconfigured on server
        if (
          orderData.keyId === 'rzp_test_placeholder_key' ||
          orderData.orderId.startsWith('order_test_')
        ) {
          setIsProcessing(false);
          const unconfigMsg =
            'Payment Gateway Pending: Razorpay API keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured in the server environment. Please configure your merchant keys before proceeding.';
          setError(unconfigMsg);
          Alert.alert('Configuration Required', unconfigMsg);
          return {
            success: false,
            error: unconfigMsg,
          };
        }

        // Build standard Razorpay checkout options
        const checkoutOptions: RazorpayCheckoutOptions = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: orderData.currency || 'INR',
          name: options?.title || 'FranchiseBridge',
          description:
            options?.description ||
            `Subscription Checkout (${params.planId || params.purpose})`,
          order_id: orderData.orderId,
          prefill: {
            name: options?.billingDetails?.fullName || user?.fullName || '',
            email: options?.billingDetails?.email || user?.email || '',
            contact: options?.billingDetails?.phone || user?.phone || '',
          },
          theme: {
            color: '#14243A',
          },
          modal: {
            confirm_close: true,
          },
        };

        const txRef = orderData.transaction.transactionReference;

        // 2. Select native vs WebView checkout
        const isNative = RazorpayCheckoutService.isNativeAvailable();

        if (isNative) {
          setCheckoutMode('native');
          try {
            const successData = await RazorpayCheckoutService.openNative(checkoutOptions);
            return await executeVerification(
              successData,
              txRef,
              orderData.orderId,
              options?.billingDetails
            );
          } catch (nativeErr: any) {
            setIsProcessing(false);
            if (nativeErr.cancelled) {
              return {
                success: false,
                cancelled: true,
                error: 'Payment was cancelled by user.',
              };
            }
            const nativeErrMsg = nativeErr?.message || 'Native checkout failed.';
            setError(nativeErrMsg);
            return {
              success: false,
              error: nativeErrMsg,
            };
          }
        } else {
          // Fallback to secure WebView modal for Expo Go / Web / Dev environments
          setCheckoutMode('webview');
          setWebViewOptions(checkoutOptions);
          setIsWebViewVisible(true);

          return new Promise<CheckoutResult>((resolve, reject) => {
            activeTxRef.current = {
              transactionReference: txRef,
              gatewayOrderId: orderData.orderId,
              billingDetails: options?.billingDetails,
              resolve,
              reject,
            };
          });
        }
      } catch (err: any) {
        setIsProcessing(false);
        const errMsg = err?.message || 'Failed to initiate checkout order.';
        setError(errMsg);
        return {
          success: false,
          error: errMsg,
        };
      }
    },
    [isProcessing, user, executeVerification]
  );

  return {
    isProcessing,
    isVerifying,
    error,
    checkoutMode,
    webViewOptions,
    isWebViewVisible,
    startCheckout,
    cancelWebView,
    handleWebViewSuccess,
    handleWebViewError,
  };
}
