import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { colors, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { MaterialIconName } from '@/types/domain';

type DocumentStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

type DocumentType = {
  id: string;
  name: string;
  description: string;
  details: string;
  icon: MaterialIconName;
  is_required: boolean;
  sort_order: number;
};

type CurrentUpload = {
  id: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string;
  created_at: string;
};

type ProfileDocument = {
  document_type_id: string;
  status: DocumentStatus;
  current_upload_id: string | null;
  rejection_reason: string | null;
  current_upload: CurrentUpload | null;
};

function uuidv4(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (typeof g.crypto?.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function extOf(fileName: string, mimeType?: string | null): string {
  const fromName = fileName.includes('.')
    ? fileName.split('.').pop()?.toLowerCase()
    : undefined;
  if (fromName) return fromName;
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType?.startsWith('image/')) return mimeType.split('/')[1];
  return 'bin';
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMime(mime?: string | null): boolean {
  return !!mime && mime.startsWith('image/');
}

function fileIconFor(mime?: string | null): MaterialIconName {
  if (isImageMime(mime)) return 'file-image-outline';
  if (mime === 'application/pdf') return 'file-pdf-box';
  return 'file-document-outline';
}

const STATUS_VISUAL: Record<
  DocumentStatus,
  { label: string; color: string; iconBgTone: 'mintSoft' | 'transparent' }
> = {
  pending: { label: 'Pendente envio', color: colors.pending, iconBgTone: 'mintSoft' },
  under_review: { label: 'Em análise', color: colors.warning, iconBgTone: 'transparent' },
  approved: { label: 'Aprovado', color: colors.primary, iconBgTone: 'transparent' },
  rejected: { label: 'Rejeitado — reenviar', color: colors.danger, iconBgTone: 'mintSoft' },
};

export default function OnboardingDocumentsScreen() {
  const { user, onboarding, signOut, refreshOnboarding } = useAuth();
  const uid = user?.id ?? null;

  const [types, setTypes] = useState<DocumentType[]>([]);
  const [docs, setDocs] = useState<Record<string, ProfileDocument>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [detailsType, setDetailsType] = useState<DocumentType | null>(null);
  const [viewerTypeId, setViewerTypeId] = useState<string | null>(null);
  const [viewerSignedUrl, setViewerSignedUrl] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!uid) return;
    setError(null);
    const [typesResp, docsResp] = await Promise.all([
      supabase
        .from('document_types')
        .select('id, name, description, details, icon, is_required, sort_order')
        .order('sort_order'),
      supabase
        .from('profile_documents')
        .select(
          `document_type_id, status, current_upload_id, rejection_reason,
           current_upload:profile_document_uploads!current_upload_id (
             id, file_name, mime_type, size_bytes, storage_path, created_at
           )`,
        )
        .eq('profile_id', uid),
    ]);

    if (typesResp.error || docsResp.error) {
      setError('Não foi possível carregar seus documentos. Tente novamente.');
      setLoading(false);
      return;
    }

    setTypes((typesResp.data as DocumentType[]) ?? []);
    const map: Record<string, ProfileDocument> = {};
    for (const row of (docsResp.data as unknown as ProfileDocument[]) ?? []) {
      map[row.document_type_id] = row;
    }
    setDocs(map);
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Mantém o estado local sincronizado quando o admin aprova/rejeita externamente.
  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`profile_documents_screen:${uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_documents',
          filter: `profile_id=eq.${uid}`,
        },
        () => {
          void reload();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid, reload]);

  const requiredTypes = useMemo(() => types.filter((t) => t.is_required), [types]);
  const optionalTypes = useMemo(() => types.filter((t) => !t.is_required), [types]);

  const requiredSubmittedCount = useMemo(
    () =>
      requiredTypes.filter((t) => {
        const s = docs[t.id]?.status;
        return s === 'under_review' || s === 'approved';
      }).length,
    [requiredTypes, docs],
  );

  const handleAttach = useCallback(
    async (type: DocumentType) => {
      if (!uid) return;
      if (uploadingId) return;
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (result.canceled) return;
        const asset = result.assets[0];
        if (!asset) return;

        setUploadingId(type.id);

        const uploadId = uuidv4();
        const ext = extOf(asset.name ?? 'arquivo', asset.mimeType);
        const storagePath = `${uid}/${type.id}/${uploadId}.${ext}`;

        const fileResp = await fetch(asset.uri);
        const blob = await fileResp.blob();

        const uploadResp = await supabase.storage
          .from('profile-documents')
          .upload(storagePath, blob, {
            contentType: asset.mimeType ?? undefined,
            upsert: false,
          });
        if (uploadResp.error) throw uploadResp.error;

        const insertResp = await supabase.from('profile_document_uploads').insert({
          id: uploadId,
          profile_id: uid,
          document_type_id: type.id,
          storage_path: storagePath,
          file_name: asset.name ?? `${type.id}.${ext}`,
          mime_type: asset.mimeType ?? null,
          size_bytes: asset.size ?? null,
          status_at_upload: 'under_review',
        });
        if (insertResp.error) throw insertResp.error;

        const updateResp = await supabase
          .from('profile_documents')
          .update({
            status: 'under_review',
            current_upload_id: uploadId,
            rejection_reason: null,
          })
          .eq('profile_id', uid)
          .eq('document_type_id', type.id);
        if (updateResp.error) throw updateResp.error;

        await reload();
        await refreshOnboarding();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido.';
        Alert.alert('Não foi possível enviar', message);
      } finally {
        setUploadingId(null);
      }
    },
    [uid, uploadingId, reload, refreshOnboarding],
  );

  const handleView = useCallback(async (typeId: string) => {
    const doc = docs[typeId];
    if (!doc?.current_upload) return;
    setViewerTypeId(typeId);
    setViewerSignedUrl(null);
    setViewerLoading(true);
    const { data } = await supabase.storage
      .from('profile-documents')
      .createSignedUrl(doc.current_upload.storage_path, 300);
    setViewerSignedUrl(data?.signedUrl ?? null);
    setViewerLoading(false);
  }, [docs]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }, [signOut]);

  const viewerType = viewerTypeId ? types.find((t) => t.id === viewerTypeId) ?? null : null;
  const viewerDoc = viewerTypeId ? docs[viewerTypeId] ?? null : null;
  const viewerFile = viewerDoc?.current_upload ?? null;

  const total = requiredTypes.length;
  const progress = total === 0 ? 0 : requiredSubmittedCount / total;

  return (
    <Screen background={colors.bgGreyMint} statusBar="light">
      <HeaderBar
        title="Cadastro"
        variant="primary"
        rightSlot={
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signingOut}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {signingOut ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Ionicons name="log-out-outline" size={22} color={colors.white} />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Dossiê do Perito</Text>
          <Text style={styles.introSubtitle}>
            Para liberar o app, envie todos os documentos obrigatórios. Eles entram
            em análise e, assim que aprovados, sua conta fica liberada para receber
            perícias.
          </Text>
        </View>

        <Card elevation="medium" padded={false} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso obrigatório</Text>
            <Text style={styles.progressCount}>
              {requiredSubmittedCount} de {total} enviados
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          {onboarding && onboarding.rejectedCount > 0 ? (
            <Text style={styles.rejectionNote}>
              {onboarding.rejectedCount} documento{onboarding.rejectedCount > 1 ? 's' : ''} rejeitado
              {onboarding.rejectedCount > 1 ? 's' : ''} — reveja abaixo e reenvie.
            </Text>
          ) : null}
        </Card>

        {loading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorBlock}>
            <Text style={styles.errorText}>{error}</Text>
            <Button label="Tentar novamente" variant="outlineMint" size="md" onPress={() => void reload()} />
          </View>
        ) : (
          <>
            <View style={styles.docsList}>
              {requiredTypes.map((type) => (
                <DocumentCard
                  key={type.id}
                  type={type}
                  doc={docs[type.id]}
                  uploading={uploadingId === type.id}
                  onAttach={() => handleAttach(type)}
                  onView={() => void handleView(type.id)}
                  onInfo={() => setDetailsType(type)}
                />
              ))}
            </View>

            {optionalTypes.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Documentos adicionais (se aplicável)</Text>
                <Text style={styles.sectionSubtitle}>
                  Envie apenas se a sua situação se enquadrar. Não bloqueiam o acesso ao app.
                </Text>
                <View style={styles.docsList}>
                  {optionalTypes.map((type) => (
                    <DocumentCard
                      key={type.id}
                      type={type}
                      doc={docs[type.id]}
                      uploading={uploadingId === type.id}
                      onAttach={() => handleAttach(type)}
                      onView={() => void handleView(type.id)}
                      onInfo={() => setDetailsType(type)}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        )}

        <TouchableOpacity
          style={styles.helpCard}
          activeOpacity={0.9}
          onPress={() => router.push('/(app)/chat-ia')}
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

      <ModalSheet visible={!!detailsType} onClose={() => setDetailsType(null)}>
        {detailsType && (
          <>
            <IconBadge size="xl" tone="mintSoft" style={styles.modalIcon}>
              <MaterialCommunityIcons name={detailsType.icon} size={26} color={colors.primary} />
            </IconBadge>
            <Text style={styles.modalTitle}>{detailsType.name}</Text>
            <Text style={styles.modalDescription}>{detailsType.details}</Text>
            <Button label="Entendi" size="md" onPress={() => setDetailsType(null)} />
          </>
        )}
      </ModalSheet>

      <ModalSheet
        visible={!!viewerType && !!viewerDoc}
        onClose={() => {
          setViewerTypeId(null);
          setViewerSignedUrl(null);
        }}
      >
        {viewerType && viewerDoc && (
          <>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerLabel}>Arquivo enviado</Text>
              <TouchableOpacity
                onPress={() => {
                  setViewerTypeId(null);
                  setViewerSignedUrl(null);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>{viewerType.name}</Text>

            {viewerLoading ? (
              <View style={styles.previewFileWrap}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : isImageMime(viewerFile?.mime_type) && viewerSignedUrl ? (
              <View style={styles.previewImageWrap}>
                <Image source={{ uri: viewerSignedUrl }} style={styles.previewImage} resizeMode="contain" />
              </View>
            ) : (
              <View style={styles.previewFileWrap}>
                <MaterialCommunityIcons
                  name={fileIconFor(viewerFile?.mime_type)}
                  size={42}
                  color={colors.primary}
                />
                <Text style={styles.previewNote}>
                  {viewerSignedUrl
                    ? 'Pré-visualização indisponível neste formato. Use Substituir para enviar outro arquivo.'
                    : 'Não foi possível gerar a pré-visualização.'}
                </Text>
              </View>
            )}

            {viewerFile ? (
              <View style={styles.fileMetaRow}>
                <View style={styles.fileMetaInfo}>
                  <Text style={styles.fileMetaName} numberOfLines={1}>
                    {viewerFile.file_name}
                  </Text>
                  <Text style={styles.fileMetaSize}>{formatBytes(viewerFile.size_bytes)}</Text>
                </View>
              </View>
            ) : null}

            {viewerDoc.status === 'rejected' && viewerDoc.rejection_reason ? (
              <View style={styles.rejectionBox}>
                <Text style={styles.rejectionLabel}>Motivo da rejeição</Text>
                <Text style={styles.rejectionText}>{viewerDoc.rejection_reason}</Text>
              </View>
            ) : null}

            <View style={styles.viewerActions}>
              <Button
                label="Fechar"
                variant="outlineMint"
                size="md"
                onPress={() => {
                  setViewerTypeId(null);
                  setViewerSignedUrl(null);
                }}
                style={styles.viewerBtn}
              />
              <Button
                label="Substituir"
                size="md"
                onPress={() => {
                  setViewerTypeId(null);
                  setViewerSignedUrl(null);
                  void handleAttach(viewerType);
                }}
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
  type: DocumentType;
  doc?: ProfileDocument;
  uploading: boolean;
  onAttach: () => void;
  onView: () => void;
  onInfo: () => void;
};

function DocumentCard({ type, doc, uploading, onAttach, onView, onInfo }: DocumentCardProps) {
  const status: DocumentStatus = doc?.status ?? 'pending';
  const visual = STATUS_VISUAL[status];
  const hasFile = !!doc?.current_upload;
  const showView = status !== 'pending' && hasFile;
  const showAttach = status === 'pending' || status === 'rejected';
  const attachLabel = status === 'rejected' ? 'Reenviar' : 'Anexar';

  return (
    <View style={styles.docCard}>
      <TouchableOpacity style={styles.docMain} activeOpacity={0.7} onPress={onInfo}>
        <IconBadge size="md" tone={visual.iconBgTone} style={styles.docIcon}>
          {status === 'approved' ? (
            <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
          ) : status === 'rejected' ? (
            <Ionicons name="alert-circle" size={24} color={colors.danger} />
          ) : (
            <MaterialCommunityIcons name={type.icon} size={22} color={colors.primary} />
          )}
        </IconBadge>
        <View style={styles.docContent}>
          <Text style={styles.docName} numberOfLines={2}>
            {type.name}
          </Text>
          <Text style={styles.docDescription} numberOfLines={2}>
            {type.description}
          </Text>
          <View style={styles.docStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: visual.color }]} />
            <Text style={[styles.statusText, { color: visual.color }]}>{visual.label}</Text>
          </View>
          {status === 'rejected' && doc?.rejection_reason ? (
            <Text style={styles.docRejectionReason} numberOfLines={2}>
              {doc.rejection_reason}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {uploading ? (
        <View style={styles.iconActionButton}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : showView ? (
        <TouchableOpacity
          style={styles.iconActionButton}
          onPress={onView}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="eye-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      ) : showAttach ? (
        <TouchableOpacity style={styles.docAction} activeOpacity={0.85} onPress={onAttach}>
          <MaterialCommunityIcons name="tray-arrow-up" size={16} color={colors.primary} />
          <Text style={styles.docActionText}>{attachLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
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
  rejectionNote: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.danger,
    fontWeight: fontWeight.semibold,
  },
  centerBlock: {
    paddingVertical: spacing.huge,
    alignItems: 'center',
  },
  errorBlock: {
    paddingVertical: spacing.xxl,
    alignItems: 'stretch',
    gap: spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
  docsList: {
    gap: 10,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: 4,
    paddingHorizontal: spacing.xs,
    letterSpacing: 0.4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
    lineHeight: 17,
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
  docRejectionReason: {
    marginTop: 4,
    fontSize: 11,
    color: colors.danger,
    lineHeight: 15,
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
    marginTop: spacing.md,
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
  previewNote: {
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
    marginBottom: 14,
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
  rejectionBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  rejectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.danger,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rejectionText: {
    fontSize: 12,
    color: colors.danger,
    lineHeight: 17,
  },
  viewerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewerBtn: {
    flex: 1,
  },
});
