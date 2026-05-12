import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ: FaqItem[] = [
  {
    question: 'Quais documentos preciso enviar?',
    answer:
      'O cadastro reúne 16 itens: documento pessoal (RG ou CNH), cédula do órgão de classe, comprovante de CPF, título de eleitor, comprovante de residência, regularidade financeira, certidão ético-profissional, diploma, certificado de especializações (se houver), certidão de RQE (exclusivo médicos), comprovante NIT, currículo, dados bancários, foto profissional, inscrição municipal (TJMG e Justiça do Trabalho) e certificado de curso em perícia judicial (TJRJ). Toque em cada item no dossiê para ver as exigências detalhadas.',
  },
  {
    question: 'Como tirar a Certidão Ético-Profissional?',
    answer:
      'Acesse o portal do seu órgão de classe (CRM, CREA, CAU, COREN, etc.), faça login com o número da sua inscrição e solicite a Certidão Ético-Profissional. Atenção aos prazos: o TJPR só aceita certidões emitidas há, no máximo, 30 dias corridos, e o TJRJ exige inexistência de conduta disciplinar nos últimos 10 anos.',
  },
  {
    question: 'O comprovante de CPF da Receita serve?',
    answer:
      'Sim — e é o único aceito. Precisa ser emitido pela Receita Federal, com no máximo 30 dias de emissão, exibindo nome completo, número do CPF, data de nascimento e a situação "REGULAR".',
  },
  {
    question: 'Posso enviar fotos do celular?',
    answer:
      'Sim. Aceitamos JPG, PNG e PDF de até 10 MB por arquivo. Para documentos físicos, tire a foto em local bem iluminado, sem reflexos, e certifique-se de que todos os dados estão legíveis. Para documentos com frente e verso, anexe as duas faces.',
  },
  {
    question: 'Quanto tempo leva a validação?',
    answer:
      'Após o envio completo do dossiê, nossa equipe faz a validação em até 48 horas úteis. Você receberá notificações por e-mail e no app a cada etapa concluída. Documentos com pendências são sinalizados individualmente para reenvio.',
  },
  {
    question: 'Posso editar um documento já enviado?',
    answer:
      'Sim. No dossiê, toque no ícone de olho ao lado do documento anexado para visualizá-lo. Dentro da pré-visualização há um botão "Remover" que permite excluir o arquivo e enviar uma nova versão.',
  },
];

const HUMAN_SUPPORT_URL = 'https://wa.me/5511999999999';

export default function ChatIAScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const hasConversation = messages.length > 0;

  const suggestedQuestions = useMemo(() => {
    const asked = new Set(
      messages.filter((m) => m.role === 'user').map((m) => m.text)
    );
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

    const userId = `u-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userId, role: 'user', text: trimmed }]);
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

  const handleSuggestionTap = (item: FaqItem) => {
    sendMessage(item.question, item.answer);
  };

  const handleSend = () => sendMessage(input);

  const handleHumanSupport = () => {
    Linking.openURL(HUMAN_SUPPORT_URL).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <MaterialCommunityIcons name="robot-happy" size={20} color="#FFFFFF" />
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
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!hasConversation && (
            <View style={styles.welcomeBlock}>
              <View style={styles.welcomeAvatar}>
                <MaterialCommunityIcons
                  name="robot-happy"
                  size={30}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.welcomeTitle}>Olá! Eu sou a Mia</Text>
              <Text style={styles.welcomeSubtitle}>
                Posso te ajudar com dúvidas sobre o cadastro, documentos
                obrigatórios e prazos. Escolha uma pergunta abaixo ou escreva a
                sua.
              </Text>
            </View>
          )}

          {hasConversation && (
            <View style={styles.thread}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.bubbleRow,
                    message.role === 'user'
                      ? styles.bubbleRowUser
                      : styles.bubbleRowAssistant,
                  ]}
                >
                  {message.role === 'assistant' && (
                    <View style={styles.bubbleAvatar}>
                      <MaterialCommunityIcons
                        name="robot-happy"
                        size={14}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      message.role === 'user'
                        ? styles.bubbleUser
                        : styles.bubbleAssistant,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        message.role === 'user'
                          ? styles.bubbleTextUser
                          : styles.bubbleTextAssistant,
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                </View>
              ))}

              {isThinking && (
                <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
                  <View style={styles.bubbleAvatar}>
                    <MaterialCommunityIcons
                      name="robot-happy"
                      size={14}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={[styles.bubble, styles.bubbleAssistant]}>
                    <ActivityIndicator size="small" color="#4AAFA6" />
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
                  <TouchableOpacity
                    key={item.question}
                    style={styles.suggestionChip}
                    activeOpacity={0.85}
                    onPress={() => handleSuggestionTap(item)}
                  >
                    <MaterialCommunityIcons
                      name="lightbulb-on-outline"
                      size={14}
                      color="#4AAFA6"
                    />
                    <Text style={styles.suggestionText}>{item.question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.humanLink}
            onPress={handleHumanSupport}
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
              placeholderTextColor="#A0AEB8"
              multiline
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !input.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={!input.trim()}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F2',
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4AAFA6',
    paddingTop: Platform.select({ ios: 56, android: 36, default: 14 }),
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
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
    borderColor: '#4AAFA6',
  },
  headerTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    lineHeight: 19,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
    marginTop: 2,
    lineHeight: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  welcomeBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#4AAFA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#4AAFA6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A3A36',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#687076',
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  thread: {
    gap: 12,
    marginBottom: 18,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#4AAFA6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#4AAFA6',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0EDEB',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bubbleTextAssistant: {
    color: '#1A3A36',
  },
  suggestionsBlock: {
    marginTop: 4,
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4AAFA6',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0EDEB',
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3A36',
    flex: 1,
  },
  humanLink: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 8,
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EDEF',
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#F4F7F7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: '#1A3A36',
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4AAFA6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4AAFA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#A8D4CF',
    shadowOpacity: 0,
    elevation: 0,
  },
});
