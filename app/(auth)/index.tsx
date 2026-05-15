import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/theme';

const STORAGE_KEY = '@mpericias:onboarding_seen';

/**
 * Entry point da área (auth). Usa router.replace imperativo para
 * redirecionar — mais confiável que <Redirect> no Expo Router web.
 */
export default function AuthIndex() {
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'true') {
        router.replace('/login');
      } else {
        router.replace('/welcome');
      }
    });
  }, []);

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
