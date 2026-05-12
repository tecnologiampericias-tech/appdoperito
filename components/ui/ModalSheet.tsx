import React from 'react';
import { Modal, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
};

export function ModalSheet({ visible, onClose, children, contentStyle }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, contentStyle]} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.modal,
    paddingHorizontal: 22,
    paddingVertical: spacing.xxl,
    width: '100%',
    maxWidth: 380,
    ...shadow.modal,
  },
});
