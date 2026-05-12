import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { colors } from '@/constants/theme';

type Props = {
  background?: string;
  statusBar?: StatusBarStyle;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Screen({
  background = colors.bgGreyLight,
  statusBar = 'dark',
  children,
  style,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: background }, style]}>
      <StatusBar style={statusBar} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
