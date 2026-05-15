import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = '@mpericias:onboarding_seen';

export default function AppIndex() {
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

  if (!onboardingSeen) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <Redirect href="/(auth)/login" />;
}
