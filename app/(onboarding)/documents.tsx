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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { MaterialIconName } from '@/types/domain';

type DocumentStatus =
  | 'pending'
  | 'ready_to_submit'
  | 'under_review'
  | 'approved'
  | 'rejected';

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

const DOC_SELECT = `document_type_id, status, current_upload_id, rejection_reason,
  current_upload:profile_document_uploads!current_upload_id (
    id, file_name, mime_type, size_bytes, storage_path, created_at
  )`;

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
  { label: string; color: string }
> = {
  pending:         { label: 'Pendente envio',      color: colors.pending },
  ready_to_submit: { label: 'Pronto para envio',   color: colors.primary },
  under_review:    { label: 'Em análise',          color: colors.warning },
  approved:        { label: 'Aprovado',            color: colors.primary },
  rejected:        { label: 'Rejeitado — reenviar', color: colors.danger },
};

export default function OnboardingDocumentsScreen() {
  const { user, onboarding, onboardingStatus, loading: authLoading, signOut } = useAuth();
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
  const [submitting, setSubmitting] = useState(false);
  const [submitOverlay, setSubmitOverlay] = useState(false);

  const overlayOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const checkScale = useSharedValue(0);

  const reload = useCallback(async () => {
    if (!uid) return;
    setError(null);
    const [typesResp, docsResp] = await Promise.all([
      supabase
        .from('document_types')
        .select('id, name, description, details, icon, is_required, sort_order')
        .order('sort_order'),
      supabase.from('profile_documents').select(DOC_SELECT).eq('profile_id', uid),
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

  // Realtime: quando o admin aprovar/rejeitar (ou qualquer mudança remota),
  // re-busca SOMENTE a linha alterada e atualiza o card específico — evita
  // o flash de full-reload.
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
        async (payload) => {
          const newRow = payload.new as { document_type_id?: string } | null;
          const oldRow = payload.old as { document_type_id?: string } | null;
          const typeId = newRow?.document_type_id ?? oldRow?.document_type_id;
          if (!typeId) return;
          const { data } = await supabase
            .from('profile_documents')
            .select(DOC_SELECT)
            .eq('profile_id', uid)
            .eq('document_type_id', typeId)
            .maybeSingle<ProfileDocument>();
          if (data) {
            setDocs((prev) => ({ ...prev, [typeId]: data }));
          }
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid]);

  // Animação do overlay de sucesso + navegação após.
  useEffect(() => {
    if (!submitOverlay) return;
    overlayOpacity.value = withTiming(1, { duration: 260 });
    cardOpacity.value = withDelay(80, withTiming(1, { duration: 240 }));
    cardScale.value = withDelay(80, withSpring(1, { damping: 14, stiffness: 130 }));
    checkScale.value = withDelay(360, withSpring(1, { damping: 8, stiffness: 150 }));

    const timer = setTimeout(() => {
      router.replace('/(app)/(tabs)');
    }, 2700);
    return () => clearTimeout(timer);
  }, [submitOverlay, overlayOpacity, cardOpacity, cardScale, checkScale]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const requiredTypes = useMemo(() => types.filter((t) => t.is_required), [types]);
  const optionalTypes = useMemo(() => types.filter((t) => !t.is_required), [types]);

  const requiredWithFileCount = useMemo(
    () =>
      requiredTypes.filter((t) => {
        const s = docs[t.id]?.status;
        return s === 'ready_to_submit' || s === 'under_review' || s === 'approved';
      }).length,
    [requiredTypes, docs],
  );

  const hasAnythingToSubmit = useMemo(
    () => Object.values(docs).some((d) => d.status === 'ready_to_submit'),
    [docs],
  );

  const canSubmit =
    requiredTypes.length > 0 &&
    requiredWithFileCount === requiredTypes.length &&
    hasAnythingToSubmit &&
    !submitting;

  const rejectedCount = useMemo(
    () => Object.values(docs).filter((d) => d.status === 'rejected').length,
    [docs],
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
          status_at_upload: 'ready_to_submit',
        });
        if (insertResp.error) throw insertResp.error;

        const updateResp = await supabase
          .from('profile_documents')
          .update({
            status: 'ready_to_submit',
            current_upload_id: uploadId,
            rejection_reason: null,
          })
          .eq('profile_id', uid)
          .eq('document_type_id', type.id);
        if (updateResp.error) throw updateResp.error;

        // Atualização inline — substitui o card SEM reload geral. O realtime
        // pode disparar logo depois com os mesmos dados (idempotente).
        const newDoc: ProfileDocument = {
          document_type_id: type.id,
          status: 'ready_to_submit',
          current_upload_id: uploadId,
          rejection_reason: null,
          current_upload: {
            id: uploadId,
            file_name: asset.name ?? `${type.id}.${ext}`,
            mime_type: asset.mimeType ?? null,
            size_bytes: asset.size ?? null,
            storage_path: storagePath,
            created_at: new Date().toISOString(),
          },
        };
        setDocs((prev) => ({ ...prev, [type.id]: newDoc }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido.';
        Alert.alert('Não foi possível enviar', message);
      } finally {
        setUploadingId(null);
      }
    },
    [uid, uploadingId],
  );

  const handleSubmitAll = useCallback(async () => {
    if (!uid || submitting || !canSubmit) return;
    setSubmitting(true);
    // Liga overlay ANTES da query para suprimir o redirect do gate quando
    // o status agregado mudar de incomplete → under_review.
    setSubmitOverlay(true);

    const { error: submitError } = await supabase
      .from('profile_documents')
      .update({ status: 'under_review' })
      .eq('profile_id', uid)
      .eq('status', 'ready_to_submit');

    if (submitError) {
      setSubmitOverlay(false);
      setSubmitting(false);
      // Reset animação para a próxima tentativa.
      overlayOpacity.value = 0;
      cardOpacity.value = 0;
      cardScale.value = 0.85;
      checkScale.value = 0;
      Alert.alert('Não foi possível enviar', submitError.message);
    }
    // No sucesso, o useEffect[submitOverlay] cuida da animação + navegação.
  }, [uid, submitting, canSubmit, overlayOpacity, cardOpacity, cardScale, checkScale]);

  const handleView = useCallback(
    async (typeId: string) => {
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
    },
    [docs],
  );

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }, [signOut]);

  // Gate: aguarda auth, mas com submitOverlay aberto mantém a tela montada
  // mesmo se status sair de incomplete (animação até navegar manualmente).
  if (authLoading) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (onboardingStatus !== 'documents_incomplete' && !submitOverlay) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const viewerType = viewerTypeId ? types.find((t) => t.id === viewerTypeId) ?? null : null;
  const viewerDoc = viewerTypeId ? docs[viewerTypeId] ?? null : null;
  const viewerFile = viewerDoc?.current_upload ?? null;

  const total = requiredTypes.length;
  const progress = total === 0 ? 0 : requiredWithFileCount / total;

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
            Anexe todos os documentos obrigatórios e clique em "Enviar para análise".
            Sua conta fica liberada assim que nossa equipe aprovar.
          </Text>
        </View>

        <Card elevation="medium" padded={false} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso obrigatório</Text>
            <Text style={styles.progressCount}>
              {requiredWithFileCount} de {total} anexados
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          {rejectedCount > 0 ? (
            <Text style={styles.rejectionNote}>
              {rejectedCount} documento{rejectedCount > 1 ? 's' : ''} rejeitado
              {rejectedCount > 1 ? 's' : ''} — reveja abaixo e reenvie.
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
            <Button
              label="Tentar novamente"
              variant="outlineMint"
              size="md"
              onPress={() => void reload()}
            />
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
                  Envie apenas se sua situação se enquadrar. Não bloqueiam o acesso ao app.
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

        <View style={{ height: spacing.huge }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerPrimary, !canSubmit && styles.footerPrimaryDisabled]}
          onPress={handleSubmitAll}
          activeOpacity={0.85}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.footerPrimaryText}>ENVIAR PARA ANÁLISE</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.white} />
            </>
          )}
        </TouchableOpacity>
        {!canSubmit && !submitting ? (
          <Text style={styles.footerHint}>
            {rejectedCount > 0
              ? 'Reenvie os documentos rejeitados para liberar o envio.'
              : `Faltam ${Math.max(total - requiredWithFileCount, 0)} documento(s) obrigatório(s).`}
          </Text>
        ) : null}
      </View>

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

      {submitOverlay ? (
        <Animated.View pointerEvents="auto" style={[styles.overlay, overlayStyle]}>
          <Animated.View style={[styles.overlayCard, cardStyle]}>
            <Animated.View style={[styles.checkBadge, checkStyle]}>
              <Ionicons name="checkmark" size={56} color={colors.white} />
            </Animated.View>
            <Text style={styles.overlayTitle}>Cadastro enviado!</Text>
            <Text style={styles.overlaySubtitle}>
              Sua documentação está em análise. Você receberá uma resposta em breve.
            </Text>
            <ActivityIndicator color={colors.primary} style={styles.overlaySpinner} />
          </Animated.View>
        </Animated.View>
      ) : null}
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
        <IconBadge
          size="md"
          tone={status === 'approved' || status === 'ready_to_submit' ? 'transparent' : 'mintSoft'}
          style={styles.docIcon}
        >
          {status === 'approved' ? (
            <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
          ) : status === 'ready_to_submit' ? (
            <Ionicons name="cloud-done-outline" size={24} color={colors.primary} />
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
  fullCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgGreyMint,
  },
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: layout.iosBottomSafe,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.topBarUp,
  },
  footerPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  footerHint: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  overlayCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.hero ?? 24,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.huge,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  checkBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  overlaySubtitle: {
    fontSize: 13,
    color: colors.textBody,
    lineHeight: 19,
    textAlign: 'center',
  },
  overlaySpinner: {
    marginTop: spacing.lg,
  },
});
