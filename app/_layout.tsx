import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: 'login',
};

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
      }}
    >
      <ActivityIndicator color={colors.white} />
    </View>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Sem sessão: o Stack só conhece login/signup. Qualquer outra rota cai no
  // fallback `initialRouteName: 'login'` — o sistema autenticado nem existe
  // na árvore, então é impossível acessá-lo.
  if (!session) {
    return (
      <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="dossie" />
      <Stack.Screen name="chat-ia" />
      <Stack.Screen name="laudo/[id]" />
      <Stack.Screen name="pericia/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
