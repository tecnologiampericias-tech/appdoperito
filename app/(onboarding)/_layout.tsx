import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/theme';

export default function OnboardingLayout() {
  const { session, loading } = useAuth();

  if (loading) {
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

  if (!session) {
    return <Redirect href="/login" />;
  }

  // O gate por onboardingStatus é feito dentro da própria tela documents.tsx
  // para que a animação de "Enviar para análise" não seja interrompida
  // quando o status flippa de incomplete → under_review.
  return <Stack screenOptions={{ headerShown: false }} />;
}
