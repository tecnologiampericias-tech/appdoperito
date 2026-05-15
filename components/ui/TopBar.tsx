import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, spacing } from '@/constants/theme';
import { UserMark } from './UserMark';

type Props = {
  background?: string;
  onBellPress?: () => void;
  hasNotification?: boolean;
};

export function TopBar({
  background = colors.bgGreyLight,
  onBellPress,
  hasNotification = true,
}: Props) {
  return (
    <View style={[styles.bar, { backgroundColor: background }]}>
      <UserMark />
      <TouchableOpacity
        style={styles.bell}
        activeOpacity={0.7}
        onPress={onBellPress}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.inputText} />
        {hasNotification && (
          <View style={[styles.dot, { borderColor: background }]} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: layout.statusBarTop,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  bell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dangerNotif,
    borderWidth: 1.5,
  },
});
