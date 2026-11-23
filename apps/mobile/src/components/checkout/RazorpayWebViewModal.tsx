import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import {
  RazorpayCheckoutOptions,
  RazorpaySuccessData,
  RazorpayErrorData,
} from '../../types/payment';

interface RazorpayWebViewModalProps {
  visible: boolean;
  options: RazorpayCheckoutOptions | null;
  onSuccess: (data: RazorpaySuccessData) => void;
  onError: (error: RazorpayErrorData | { description: string }) => void;
  onCancel: () => void;
}

export const RazorpayWebViewModal: React.FC<RazorpayWebViewModalProps> = ({
  visible,
  options,
  onSuccess,
  onError,
  onCancel,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  if (!visible || !options) return null;

  // Generate secure Razorpay checkout standard HTML
  const checkoutHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          * { box-sizing: border-box; }
          body {
            background-color: #0F172A;
            color: #F8FAFC;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 24px;
            text-align: center;
          }
          .spinner {
            width: 44px;
            height: 44px;
            border: 3px solid rgba(255, 255, 255, 0.15);
            border-top: 3px solid #6366F1;
            border-radius: 50%;
            animation: spin 0.9s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h2 { font-size: 17px; font-weight: 600; margin: 0 0 6px 0; color: #F8FAFC; }
          p { font-size: 13px; color: #94A3B8; margin: 0; }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2>Initializing Razorpay Checkout...</h2>
        <p>Opening secure payments gateway window. Please do not close.</p>
        <script>
          try {
            var options = {
              key: ${JSON.stringify(options.key)},
              amount: ${JSON.stringify(options.amount)},
              currency: ${JSON.stringify(options.currency || 'INR')},
              name: ${JSON.stringify(options.name || 'FranchiseBridge')},
              description: ${JSON.stringify(options.description || 'FranchiseBridge Transaction')},
              order_id: ${JSON.stringify(options.order_id)},
              prefill: ${JSON.stringify(options.prefill || {})},
              theme: { color: '#14243A' },
              modal: {
                ondismiss: function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAYMENT_CANCELLED',
                    data: { description: 'Payment modal closed by user.' }
                  }));
                }
              },
              handler: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYMENT_SUCCESS',
                  data: {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                  }
                }));
              }
            };
            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function(resp) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_ERROR',
                data: resp.error || { description: 'Razorpay payment capture failed.' }
              }));
            });
            window.onload = function() {
              rzp.open();
            };
          } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_ERROR',
              data: { description: e.message || 'Failed to initialize checkout client.' }
            }));
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload.type === 'PAYMENT_SUCCESS') {
        onSuccess(payload.data as RazorpaySuccessData);
      } else if (payload.type === 'PAYMENT_CANCELLED') {
        onCancel();
      } else if (payload.type === 'PAYMENT_ERROR') {
        onError(payload.data);
      }
    } catch {
      onError({ description: 'Unable to parse payment gateway response.' });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onCancel}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            accessibilityLabel="Cancel Payment"
          >
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Razorpay Secure Checkout</Text>
            <Text style={styles.headerSubtitle}>256-Bit Encrypted Gateway</Text>
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading Checkout Gateway...</Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: checkoutHtml, baseUrl: 'https://checkout.razorpay.com' }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          style={styles.webView}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  closeButton: {
    padding: 6,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  loadingContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 13,
  },
  webView: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
