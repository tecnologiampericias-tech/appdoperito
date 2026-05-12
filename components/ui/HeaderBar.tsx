import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontWeight, layout, spacing } from '@/constants/theme';

type Variant = 'primary' | 'plain' | 'compact';

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: 'arrow-back' | 'close';
  rightSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  variant?: Variant;
  style?: ViewStyle;
};

export function HeaderBar({
  title,
  subtitle,
  onBack,
  backIcon = 'arrow-back',
  rightSlot,
  centerSlot,
  variant = 'plain',
  style,
}: Props) {
  const onPrimary = variant === 'primary';
  const isCompact = variant === 'compact';

  return (
    <View
      style={[
        styles.bar,
        isCompact ? styles.compact : null,
        onPrimary ? styles.primary : styles.plain,
        style,
      ]}
    >
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={isCompact ? styles.compactIcon : styles.iconWrap}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={backIcon}
            size={22}
            color={onPrimary ? colors.white : colors.text}
          />
        </TouchableOpacity>
      ) : (
        <View style={isCompact ? styles.compactIcon : styles.iconWrap} />
      )}

      <View style={styles.center}>
        {centerSlot ?? (
          <>
            {title ? (
              <Text
                style={[
                  styles.title,
                  onPrimary && styles.titleOnPrimary,
                ]}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </>
        )}
      </View>

      <View style={isCompact ? styles.compactIcon : styles.iconWrap}>
        {rightSlot}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
    paddingTop: layout.compactHeaderTop,
    paddingBottom: spacing.md + 2,
  },
  plain: {
    paddingTop: layout.statusBarTop,
    paddingBottom: spacing.md,
  },
  compact: {
    paddingTop: layout.statusBarTop,
    paddingBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: 0.2,
  },
  titleOnPrimary: {
    color: colors.white,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 1,
  },
});
