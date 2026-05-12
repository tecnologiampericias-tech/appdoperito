import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontWeight, radius, shadow } from '@/constants/theme';

type Variant =
  | 'primary'
  | 'primaryDark'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'social-google'
  | 'social-apple'
  | 'outlineMint';

type Size = 'sm' | 'md' | 'lg';

type Props = TouchableOpacityProps & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  textStyle?: TextStyle;
};

const HEIGHTS: Record<Size, number> = { sm: 40, md: 48, lg: 54 };

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading,
  iconLeft,
  iconRight,
  fullWidth = true,
  disabled,
  style,
  textStyle,
  ...rest
}: Props) {
  const visual = VISUALS[variant];
  const isDisabled = !!disabled || !!loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.base,
        { height: HEIGHTS[size], borderRadius: size === 'lg' ? radius.xxl : radius.xl },
        visual.container,
        isDisabled && visual.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={visual.label.color as string} />
      ) : (
        <View style={styles.inner}>
          {iconLeft}
          <Text style={[styles.label, visual.label, textStyle]}>{label}</Text>
          {iconRight}
        </View>
      )}
    </TouchableOpacity>
  );
}

type Visual = {
  container: ViewStyle;
  label: TextStyle;
  disabled?: ViewStyle;
};

const VISUALS: Record<Variant, Visual> = {
  primary: {
    container: {
      backgroundColor: colors.primary,
      ...shadow.primary,
    },
    label: { color: colors.white },
    disabled: {
      backgroundColor: colors.primaryDisabled,
      ...shadow.none,
    },
  },
  primaryDark: {
    container: {
      backgroundColor: colors.primaryDark,
      ...shadow.primaryDark,
    },
    label: { color: colors.white },
    disabled: {
      backgroundColor: colors.primaryDisabled,
      ...shadow.none,
    },
  },
  secondary: {
    container: {
      backgroundColor: colors.bgBlueGrey,
    },
    label: { color: colors.textMuted },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    },
    label: { color: colors.primary },
  },
  danger: {
    container: {
      backgroundColor: colors.dangerBg,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
    },
    label: { color: colors.danger },
  },
  outlineMint: {
    container: {
      backgroundColor: colors.primarySurfaceSoft,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    label: { color: colors.primary },
  },
  'social-google': {
    container: {
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.socialGoogleBorder,
    },
    label: { color: colors.socialGoogleText },
  },
  'social-apple': {
    container: {
      backgroundColor: colors.socialApple,
    },
    label: { color: colors.white },
  },
};

export function GoogleButton({ label, ...rest }: Omit<Props, 'variant' | 'iconLeft'>) {
  return (
    <Button
      label={label}
      variant="social-google"
      iconLeft={<Ionicons name="logo-google" size={20} color="#4285F4" />}
      {...rest}
    />
  );
}

export function AppleButton({ label, ...rest }: Omit<Props, 'variant' | 'iconLeft'>) {
  return (
    <Button
      label={label}
      variant="social-apple"
      iconLeft={<Ionicons name="logo-apple" size={22} color={colors.white} />}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
});
