import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/theme';

export default function AuthLayout() {
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

  if (session) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
