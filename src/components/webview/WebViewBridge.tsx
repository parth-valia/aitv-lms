// src/components/webview/WebViewBridge.tsx
import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { ActivityIndicator, View, Text, TouchableOpacity, Platform } from 'react-native';
import { RefreshCw, AlertCircle } from 'lucide-react-native';
import { CourseWebPayload } from '@/types/course';

export type NativeToWebMessage = 
  | { type: 'COURSE_DATA'; payload: CourseWebPayload }
  | { type: 'AUTH_TOKEN'; payload: { token: string } }
  | { type: 'THEME'; payload: { isDark: boolean } };

export type WebToNativeMessage =
  | { type: 'READY' }
  | { type: 'ENROLL_REQUEST'; payload: { courseId: string } }
  | { type: 'NAVIGATE'; payload: { screen: string; params?: Record<string, string> } }
  | { type: 'ERROR'; payload: { code: string; message: string } };

interface WebViewBridgeProps {
  source: any;
  onMessage: (message: WebToNativeMessage) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}

export interface WebViewBridgeHandle {
  postMessage: (message: NativeToWebMessage) => void;
}

export const WebViewBridge = forwardRef<WebViewBridgeHandle, WebViewBridgeProps>(
  ({ source, onMessage, onLoadStart, onLoadEnd, onError }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [hasError, setHasError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    useImperativeHandle(ref, () => ({
      postMessage: (message: NativeToWebMessage) => {
        webViewRef.current?.postMessage(JSON.stringify(message));
      },
    }));

    const handleMessage = (event: any) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as WebToNativeMessage;
        onMessage(msg);
      } catch (e) {
        console.error('WebView Bridge Parse Error:', e);
      }
    };

    const handleReload = () => {
      setHasError(false);
      setIsLoading(true);
      webViewRef.current?.reload();
    };

    const injectedHeaders = `
      (function() {
        window.NATIVE_METADATA = {
          'X-App-Platform': '${Platform.OS}',
          'X-App-Version': '1.0.0',
          'X-App-Flavor': 'Production-Grade',
          'X-Auth-Status': 'Authenticated'
        };
        // Dispatch event for web app to consume
        window.dispatchEvent(new CustomEvent('nativeMetadataReady', { detail: window.NATIVE_METADATA }));
        console.log('Native Metadata Injected & Dispatched');
      })();
    `;

    return (
      <View className="flex-1 overflow-hidden">
        <WebView
          ref={webViewRef}
          source={source}
          onMessage={handleMessage}
          onLoadStart={() => {
            setIsLoading(true);
            onLoadStart?.();
          }}
          onLoadEnd={() => {
            setIsLoading(false);
            onLoadEnd?.();
          }}
          onError={(e) => {
            setHasError(true);
            setIsLoading(false);
            onError?.();
            console.error('WebView Load Error:', e.nativeEvent);
          }}
          injectedJavaScriptBeforeContentLoaded={injectedHeaders}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          className="flex-1"
        />

        {isLoading && (
          <View className="absolute inset-0 items-center justify-center bg-white/80 dark:bg-[#0b0f10]/80">
            <ActivityIndicator size="large" color="#4c49c9" />
          </View>
        )}

        {hasError && (
          <View className="absolute inset-0 items-center justify-center bg-[#f5f7f9] dark:bg-[#0b0f10] px-6">
            <AlertCircle size={48} color="#ef4444" className="mb-4" />
            <Text className="text-lg font-bold text-[#2c2f31] dark:text-white text-center mb-2">Content Unavailable</Text>
            <Text className="text-[#747779] text-center mb-8">This screen failed to load. Please check your connection and try again.</Text>
            <TouchableOpacity 
              onPress={handleReload}
              className="flex-row items-center bg-[#4c49c9] px-6 py-3 rounded-xl"
            >
              <RefreshCw size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold">Retry Load</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
);
