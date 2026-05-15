import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontWeight } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  fallback?: string;
};

function confirmSignOut(): Promise<boolean> {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' ? window.confirm('Sair da sua conta?') : false;
    return Promise.resolve(ok);
  }
  return new Promise((resolve) => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Sair', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export function UserMark({ fallback = 'Bem-vindo' }: Props) {
  const { user, signOut } = useAuth();
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const displayName = fullName && fullName.length > 0 ? fullName : fallback;

  const handlePress = async () => {
    const ok = await confirmSignOut();
    if (ok) await signOut();
  };

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {displayName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.primaryDarker,
    flexShrink: 1,
  },
});
