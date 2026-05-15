import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { AuthProvider } from '@/contexts/AuthContext';

// Segunda cópia (runtime) do guard anti-zoom do app/+html.tsx. Plantada
// aqui pra sobreviver a qualquer regressão: se um dia alguém mexer no
// +html.tsx ou ele deixar de emitir o script inline, o app ainda registra
// os preventDefaults nos gestos de zoom. preventDefault no gesturestart é
// a única forma confiável de bloquear pinch-zoom no iOS Safari (que
// ignora user-scalable=no desde a iOS 10).
function useWebZoomGuard() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof document === 'undefined') return;
    const prevent = (e: Event) => e.preventDefault();
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };
    document.addEventListener('gesturestart', prevent as EventListener, { passive: false });
    document.addEventListener('gesturechange', prevent as EventListener, { passive: false });
    document.addEventListener('gestureend', prevent as EventListener, { passive: false });
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', prevent as EventListener);
      document.removeEventListener('gesturechange', prevent as EventListener);
      document.removeEventListener('gestureend', prevent as EventListener);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);
}

export default function RootLayout() {
  useWebZoomGuard();
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
