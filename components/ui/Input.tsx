import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontWeight, radius, spacing } from '@/constants/theme';

type Variant = 'filled' | 'outlined';

type Props = TextInputProps & {
  label?: string;
  labelRight?: React.ReactNode;
  iconLeft?: keyof typeof MaterialCommunityIcons.glyphMap | React.ReactNode;
  iconRight?: React.ReactNode;
  containerStyle?: ViewStyle;
  variant?: Variant;
};

export function Input({
  label,
  labelRight,
  iconLeft,
  iconRight,
  containerStyle,
  variant = 'filled',
  style,
  ...rest
}: Props) {
  return (
    <View style={containerStyle}>
      {(label || labelRight) && (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {labelRight}
        </View>
      )}
      <View
        style={[
          styles.container,
          variant === 'outlined' ? styles.outlined : styles.filled,
        ]}
      >
        {renderLeftIcon(iconLeft)}
        <TextInput
          placeholderTextColor={colors.textHint}
          style={[styles.input, style]}
          {...rest}
        />
        {iconRight}
      </View>
    </View>
  );
}

function renderLeftIcon(icon: Props['iconLeft']) {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return (
      <MaterialCommunityIcons
        name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={20}
        color={colors.textPlaceholder}
        style={styles.leftIcon}
      />
    );
  }
  return <View style={styles.leftIcon}>{icon}</View>;
}

type PasswordInputProps = Omit<Props, 'iconRight' | 'secureTextEntry'>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      secureTextEntry={!visible}
      iconRight={
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          style={styles.rightIcon}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={visible ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.textPlaceholder}
          />
        </TouchableOpacity>
      }
    />
  );
}

export function SearchInput({
  containerStyle,
  ...rest
}: Omit<Props, 'iconLeft' | 'label'>) {
  return (
    <View
      style={[
        styles.container,
        styles.outlined,
        containerStyle,
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={colors.textPlaceholder}
        style={styles.leftIcon}
      />
      <TextInput
        placeholderTextColor={colors.textHint}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
    color: colors.inputText,
    letterSpacing: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md + 2,
    height: 52,
  },
  filled: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlined: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    height: 48,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.inputText,
  },
});
