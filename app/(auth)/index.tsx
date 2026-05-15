import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/theme';

const STORAGE_KEY = '@mpericias:onboarding_seen';

/**
 * Entry point da área (auth). Decide se o usuário vai para o onboarding
 * (welcome) ou direto pro login, baseado no flag persistido no AsyncStorage.
 */
export default function AuthIndex() {
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setOnboardingSeen(value === 'true');
    });
  }, []);

  if (onboardingSeen === null) {
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

  if (onboardingSeen) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/welcome" />;
}
