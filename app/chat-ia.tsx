import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen } from '@/components/ui';
import { colors, fontWeight, layout, radius, shadow, spacing } from '@/constants/theme';
import { FAQ, HUMAN_SUPPORT_URL } from '@/data/faq';
import type { ChatMessage, FaqItem } from '@/types/domain';

export default function ChatIAScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const hasConversation = messages.length > 0;

  const suggestedQuestions = useMemo(() => {
    const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.text));
    return FAQ.filter((item) => !asked.has(item.question));
  }, [messages]);

  useEffect(() => {
    if (hasConversation) {
      const id = setTimeout(
        () => scrollRef.current?.scrollToEnd({ animated: true }),
        80
      );
      return () => clearTimeout(id);
    }
  }, [messages, hasConversation, isThinking]);

  const sendMessage = (text: string, presetAnswer?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: trimmed },
    ]);
    setInput('');
    setIsThinking(true);

    const answer =
      presetAnswer ??
      'Ótima pergunta! Estou processando o melhor caminho para te responder. Enquanto isso, você pode consultar as instruções de cada documento direto no dossiê — basta tocar no nome do item.';

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: answer },
      ]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <Screen background={colors.bgGreyMint} statusBar="light">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <MaterialCommunityIcons name="robot-happy" size={20} color={colors.white} />
          <View style={styles.headerAvatarDot} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Mia</Text>
          <Text style={styles.headerSubtitle}>Assistente IA · online</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!hasConversation && <WelcomeBlock />}

          {hasConversation && (
            <View style={styles.thread}>
              {messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}
              {isThinking && (
                <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
                  <View style={styles.bubbleAvatar}>
                    <MaterialCommunityIcons name="robot-happy" size={14} color={colors.white} />
                  </View>
                  <View style={[styles.bubble, styles.bubbleAssistant]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                </View>
              )}
            </View>
          )}

          {suggestedQuestions.length > 0 && (
            <View style={styles.suggestionsBlock}>
              <Text style={styles.suggestionsLabel}>
                {hasConversation ? 'Outras dúvidas comuns' : 'Perguntas frequentes'}
              </Text>
              <View style={styles.suggestionsList}>
                {suggestedQuestions.map((item) => (
                  <SuggestionChip
                    key={item.question}
                    item={item}
                    onPress={() => sendMessage(item.question, item.answer)}
                  />
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.humanLink}
            onPress={() => Linking.openURL(HUMAN_SUPPORT_URL).catch(() => {})}
            activeOpacity={0.7}
          >
            <Text style={styles.humanLinkText}>
              Prefere falar com um atendente humano?
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Pergunte para a Mia…"
              placeholderTextColor={colors.textPlaceholder}
              multiline
              onSubmitEditing={() => sendMessage(input)}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(input)}
            activeOpacity={0.85}
            disabled={!input.trim()}
          >
            <Ionicons name="arrow-up" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function WelcomeBlock() {
  return (
    <View style={styles.welcomeBlock}>
      <View style={styles.welcomeAvatar}>
        <MaterialCommunityIcons name="robot-happy" size={30} color={colors.white} />
      </View>
      <Text style={styles.welcomeTitle}>Olá! Eu sou a Mia</Text>
      <Text style={styles.welcomeSubtitle}>
        Posso te ajudar com dúvidas sobre o cadastro, documentos obrigatórios e prazos.
        Escolha uma pergunta abaixo ou escreva a sua.
      </Text>
    </View>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant,
      ]}
    >
      {!isUser && (
        <View style={styles.bubbleAvatar}>
          <MaterialCommunityIcons name="robot-happy" size={14} color={colors.white} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text
          style={[
            styles.bubbleText,
            isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

function SuggestionChip({ item, onPress }: { item: FaqItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.suggestionChip} activeOpacity={0.85} onPress={onPress}>
      <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color={colors.primary} />
      <Text style={styles.suggestionText}>{item.question}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    backgroundColor: colors.primary,
    paddingTop: layout.compactHeaderTop,
    paddingBottom: 14,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerBack: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.onPrimary22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#86E0A6',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  headerTextWrap: { flex: 1, justifyContent: 'center' },
  headerTitle: {
    fontSize: 16,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: 0.2,
    lineHeight: 19,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontWeight: fontWeight.medium,
    color: colors.onPrimary85,
    letterSpacing: 0.2,
    marginTop: 2,
    lineHeight: 14,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  welcomeBlock: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  welcomeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...shadow.primary,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  thread: {
    gap: spacing.md,
    marginBottom: 18,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAssistant: { justifyContent: 'flex-start' },
  bubbleAvatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.xxl,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderMint,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
  },
  bubbleTextUser: {
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  bubbleTextAssistant: {
    color: colors.text,
  },
  suggestionsBlock: { marginTop: 4 },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  suggestionsList: { gap: spacing.sm },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderMint,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  humanLink: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  humanLinkText: {
    fontSize: 12,
    color: '#8A9694',
    textDecorationLine: 'underline',
    textDecorationColor: '#C7D2D0',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceInput,
    borderRadius: 22,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: colors.text,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
    ...shadow.none,
  },
});
