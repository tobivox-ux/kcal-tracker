import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { colors } from '../src/theme/colors';
import { scheduleMidnightReset } from '../src/store/nutritionStore';
import { SplashOverlay } from '../src/components/SplashOverlay';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => scheduleMidnightReset(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
