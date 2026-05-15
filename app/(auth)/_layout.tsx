import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/theme';

const STORAGE_KEY = '@mpericias:onboarding_seen';

export default function AuthLayout() {
  const { session, loading, onboardingStatus } = useAuth();
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setOnboardingSeen(value === 'true');
    });
  }, []);

  if (loading || onboardingSeen === null) {
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

  if (session) {
    if (onboardingStatus === 'documents_incomplete') {
      return <Redirect href="/(onboarding)/documents" />;
    }
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'fade' }}
      initialRouteName={onboardingSeen ? 'login' : 'welcome'}
    />
  );
}
