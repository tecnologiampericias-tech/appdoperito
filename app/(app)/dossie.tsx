import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import {
  Button,
  Card,
  HeaderBar,
  IconBadge,
  ModalSheet,
  Screen,
} from '@/components/ui';
import { colors, fontWeight, layout, radius, shadow, spacing } from '@/constants/theme';
import { DOCUMENTS, INITIAL_FILES } from '@/data/documents';
import type { AttachedFile, DocItem, MaterialIconName } from '@/types/domain';

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMime(mime?: string): boolean {
  return !!mime && mime.startsWith('image/');
}

function fileIconFor(file: AttachedFile): MaterialIconName {
  if (isImageMime(file.mimeType)) return 'file-image-outline';
  if (file.mimeType === 'application/pdf') return 'file-pdf-box';
  return 'file-document-outline';
}

export default function DossieScreen() {
  const [files, setFiles] = useState<Record<string, AttachedFile>>(INITIAL_FILES);
  const [detailsDoc, setDetailsDoc] = useState<DocItem | null>(null);
  const [viewDocId, setViewDocId] = useState<string | null>(null);

  const total = DOCUMENTS.length;
  const completed = useMemo(
    () => DOCUMENTS.filter((d) => files[d.id]).length,
    [files]
  );
  const progress = total === 0 ? 0 : completed / total;
  const allComplete = completed === total;

  const handleAttach = async (doc: DocItem) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      setFiles((prev) => ({
        ...prev,
        [doc.id]: {
          uri: asset.uri,
          name: asset.name ?? 'arquivo',
          mimeType: asset.mimeType,
          size: asset.size,
        },
      }));
    } catch {
      Alert.alert(
        'Não foi possível anexar',
        'Tente novamente em alguns instantes ou escolha outro arquivo.'
      );
    }
  };

  const handleRemove = (docId: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    setViewDocId((current) => (current === docId ? null : current));
  };

  const viewDoc = viewDocId ? DOCUMENTS.find((d) => d.id === viewDocId) ?? null : null;
  const viewFile = viewDocId ? files[viewDocId] : undefined;

  return (
    <Screen background={colors.bgGreyMint} statusBar="light">
      <HeaderBar title="Cadastro" variant="primary" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Dossiê Médico</Text>
          <Text style={styles.introSubtitle}>
            Complete seu perfil anexando os documentos obrigatórios. Você pode enviá-los em
            qualquer ordem — toque em cada item para ver o que é necessário.
          </Text>
        </View>

        <Card elevation="medium" padded={false} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text style={styles.progressCount}>
              {completed} de {total} concluídos
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </Card>

        <View style={styles.docsList}>
          {DOCUMENTS.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              file={files[doc.id]}
              onAttach={() => handleAttach(doc)}
              onView={() => setViewDocId(doc.id)}
              onInfo={() => setDetailsDoc(doc)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.helpCard}
          activeOpacity={0.9}
          onPress={() => router.push('/chat-ia')}
        >
          <View style={styles.helpAvatar}>
            <MaterialCommunityIcons name="robot-happy" size={26} color={colors.white} />
            <View style={styles.helpAvatarDot} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpEyebrow}>ASSISTENTE IA</Text>
            <Text style={styles.helpTitle}>Tirar dúvidas com a Mia</Text>
            <Text style={styles.helpText}>
              Resposta em segundos sobre documentos, prazos e como emitir cada certidão.
            </Text>
          </View>
          <View style={styles.helpChevron}>
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerSecondary}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color={colors.primary} />
          <Text style={styles.footerSecondaryText}>VOLTAR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerPrimary, !allComplete && styles.footerPrimaryDisabled]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
          disabled={!allComplete}
        >
          <Text style={styles.footerPrimaryText}>PRÓXIMO</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ModalSheet visible={!!detailsDoc} onClose={() => setDetailsDoc(null)}>
        {detailsDoc && (
          <>
            <IconBadge size="xl" tone="mintSoft" style={styles.modalIcon}>
              <MaterialCommunityIcons name={detailsDoc.icon} size={26} color={colors.primary} />
            </IconBadge>
            <Text style={styles.modalTitle}>{detailsDoc.name}</Text>
            <Text style={styles.modalDescription}>{detailsDoc.details}</Text>
            <Button label="Entendi" size="md" onPress={() => setDetailsDoc(null)} />
          </>
        )}
      </ModalSheet>

      <ModalSheet visible={!!viewDoc && !!viewFile} onClose={() => setViewDocId(null)}>
        {viewDoc && viewFile && (
          <>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerLabel}>Arquivo anexado</Text>
              <TouchableOpacity
                onPress={() => setViewDocId(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>{viewDoc.name}</Text>

            {isImageMime(viewFile.mimeType) && viewFile.uri ? (
              <View style={styles.previewImageWrap}>
                <Image source={{ uri: viewFile.uri }} style={styles.previewImage} resizeMode="contain" />
              </View>
            ) : (
              <View style={styles.previewFileWrap}>
                <MaterialCommunityIcons name={fileIconFor(viewFile)} size={42} color={colors.primary} />
                {viewFile.isMock && (
                  <Text style={styles.previewMockNote}>
                    Pré-visualização indisponível neste ambiente.
                  </Text>
                )}
              </View>
            )}

            <View style={styles.fileMetaRow}>
              <View style={styles.fileMetaInfo}>
                <Text style={styles.fileMetaName} numberOfLines={1}>
                  {viewFile.name}
                </Text>
                <Text style={styles.fileMetaSize}>{formatBytes(viewFile.size)}</Text>
              </View>
            </View>

            <View style={styles.viewerActions}>
              <Button
                label="Fechar"
                variant="outlineMint"
                size="md"
                onPress={() => setViewDocId(null)}
                style={styles.viewerBtn}
              />
              <Button
                label="Remover"
                variant="danger"
                size="md"
                iconLeft={<MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.danger} />}
                onPress={() => handleRemove(viewDoc.id)}
                style={styles.viewerBtn}
              />
            </View>
          </>
        )}
      </ModalSheet>
    </Screen>
  );
}

type DocumentCardProps = {
  doc: DocItem;
  file?: AttachedFile;
  onAttach: () => void;
  onView: () => void;
  onInfo: () => void;
};

function DocumentCard({ doc, file, onAttach, onView, onInfo }: DocumentCardProps) {
  const isAttached = !!file;
  return (
    <View style={styles.docCard}>
      <TouchableOpacity style={styles.docMain} activeOpacity={0.7} onPress={onInfo}>
        <IconBadge size="md" tone={isAttached ? 'transparent' : 'mintSoft'} style={styles.docIcon}>
          {isAttached ? (
            <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
          ) : (
            <MaterialCommunityIcons name={doc.icon} size={22} color={colors.primary} />
          )}
        </IconBadge>
        <View style={styles.docContent}>
          <Text style={styles.docName} numberOfLines={2}>
            {doc.name}
          </Text>
          <Text style={styles.docDescription} numberOfLines={2}>
            {doc.description}
          </Text>
          <View style={styles.docStatusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isAttached ? colors.primary : colors.pending },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isAttached ? colors.primary : colors.pending },
              ]}
            >
              {isAttached ? 'Anexado' : 'Pendente envio'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isAttached ? (
        <TouchableOpacity
          style={styles.iconActionButton}
          onPress={onView}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="eye-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.docAction} activeOpacity={0.85} onPress={onAttach}>
          <MaterialCommunityIcons name="tray-arrow-up" size={16} color={colors.primary} />
          <Text style={styles.docActionText}>Anexar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },
  intro: {
    marginBottom: 18,
    paddingHorizontal: spacing.xs,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: 6,
  },
  introSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  progressCard: {
    paddingHorizontal: 18,
    paddingVertical: spacing.lg,
    marginBottom: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.4,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  docsList: {
    gap: 10,
    marginBottom: 18,
  },
  docCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow.soft,
  },
  docMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    marginRight: spacing.md,
  },
  docContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  docName: {
    fontSize: 14,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 3,
    lineHeight: 18,
  },
  docDescription: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: 6,
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  docAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySurfaceSoft,
    gap: 6,
  },
  docActionText: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.3,
  },
  iconActionButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  helpAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.xxl,
    backgroundColor: colors.onPrimary16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  helpAvatarDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.onlineDot,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  helpContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  helpEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.onPrimary75,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: colors.onPrimary85,
    lineHeight: 17,
  },
  helpChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.onPrimary18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: layout.iosBottomSafe,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.topBarUp,
  },
  footerSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  footerSecondaryText: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  footerPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 6,
    ...shadow.primary,
  },
  footerPrimaryDisabled: {
    backgroundColor: colors.primaryDisabled,
    ...shadow.none,
  },
  footerPrimaryText: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  modalIcon: {
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: 13,
    color: colors.textBody,
    lineHeight: 19,
    marginBottom: spacing.xl,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  viewerLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  previewImageWrap: {
    height: 220,
    backgroundColor: colors.primarySurfaceSoft,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFileWrap: {
    height: 140,
    backgroundColor: colors.primarySurfaceSoft,
    borderRadius: radius.xl,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: 10,
  },
  previewMockNote: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: 18,
  },
  fileMetaInfo: { flex: 1 },
  fileMetaName: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  fileMetaSize: {
    fontSize: 11,
    color: colors.textMuted,
  },
  viewerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewerBtn: {
    flex: 1,
  },
});
