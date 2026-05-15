import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontWeight, radius, spacing } from '@/constants/theme';

type ToastVariant = 'error' | 'warning' | 'success';

type Props = {
  message: string | null;
  variant?: ToastVariant;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms (0 = never). Default 5000. */
  duration?: number;
};

const variantConfig: Record<
  ToastVariant,
  {
    bg: string;
    border: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    textColor: string;
  }
> = {
  error: {
    bg: '#FEF2F0',
    border: '#F5C6BE',
    icon: 'alert-circle',
    iconColor: colors.danger,
    textColor: '#7A2E22',
  },
  warning: {
    bg: '#FFF8E6',
    border: '#F0D87A',
    icon: 'warning',
    iconColor: colors.warning,
    textColor: '#6B5200',
  },
  success: {
    bg: '#EEFAF2',
    border: '#B4E4C4',
    icon: 'checkmark-circle',
    iconColor: '#2E8B57',
    textColor: '#1A5C36',
  },
};

export function Toast({
  message,
  variant = 'error',
  onDismiss,
  duration = 5000,
}: Props) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(false);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      isVisibleRef.current = false;
      onDismiss();
    });
  }, [translateY, opacity, onDismiss]);

  useEffect(() => {
    if (message) {
      isVisibleRef.current = true;
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(hide, duration);
      }
    } else if (isVisibleRef.current) {
      hide();
    }
  }, [message, duration, translateY, opacity, hide]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!message) return null;

  const config = variantConfig[variant];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={config.icon} size={20} color={config.iconColor} />
      </View>
      <Text style={[styles.text, { color: config.textColor }]} numberOfLines={3}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={hide}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={16} color={config.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrap: {
    marginRight: spacing.md,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: 4,
  },
});
