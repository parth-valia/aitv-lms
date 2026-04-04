// src/components/ui/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      extra: { errorInfo },
    });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View className="flex-1 items-center justify-center bg-white px-6">
            <View className="bg-red-50 p-6 rounded-3xl items-center w-full">
              <Text className="text-2xl font-bold text-slate-900 mb-2">Oops!</Text>
              <Text className="text-slate-500 text-center mb-6">
                Something went wrong. Our team has been notified.
              </Text>
              <Button title="Try Again" onPress={this.handleReset} className="w-full" />
            </View>
          </View>
        )
      );
    }

    return this.props.children;
  }
}
