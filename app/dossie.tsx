import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

type DocItem = {
  id: string;
  name: string;
  description: string;
  details: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type AttachedFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  isMock?: boolean;
};

const DOCUMENTS: DocItem[] = [
  {
    id: 'doc-pessoal',
    name: 'Documento Pessoal (RG ou CNH)',
    description: 'RG ou CNH com foto e dados pessoais legíveis.',
    details:
      'RG: número do registro (alguns já trazem o CPF), data de expedição, validade dentro de 10 anos contados desta data, nome completo, nome completo do pai e da mãe, órgão de expedição e foto.\n\nCNH: número do RG com órgão expedidor e CPF, data de validade, nome completo, nome do pai e da mãe, e foto.',
    icon: 'card-account-details-outline',
  },
  {
    id: 'cedula-profissional',
    name: 'Cédula Profissional (Órgão de Classe)',
    description: 'CRM, CREA, CAU, COREN ou outro conselho aplicável.',
    details:
      'Precisa conter foto, número da inscrição no órgão de classe, dados pessoais (RG, CPF, nome completo, nome dos pais) e a data de inscrição/expedição.',
    icon: 'badge-account-horizontal-outline',
  },
  {
    id: 'cpf',
    name: 'Comprovante de CPF',
    description: 'Emitido pela Receita Federal nos últimos 30 dias.',
    details:
      'Emitido obrigatoriamente junto à Receita Federal. Deve conter nome completo, número do CPF, data de nascimento, situação "REGULAR" e data de emissão dentro de 30 dias corridos.',
    icon: 'numeric',
  },
  {
    id: 'titulo-eleitor',
    name: 'Título de Eleitor',
    description: 'Versão eletrônica ou física, com dados completos.',
    details:
      'Aceito tanto o eletrônico quanto o físico. Precisa conter nome completo, número do CPF, número do título, seção, zona e nome completo dos pais.',
    icon: 'vote-outline',
  },
  {
    id: 'residencia',
    name: 'Comprovante de Residência',
    description: 'TJPR até 30 dias; demais tribunais até 3 meses.',
    details:
      'TJPR: atualizado até 30 dias e sem mostrar valores ou descrição de serviços. Demais tribunais: atualizado até 3 meses e sem qualquer rasura.\n\nDeve conter data de vencimento, nome completo do profissional, endereço completo, CEP e cidade/UF.',
    icon: 'home-outline',
  },
  {
    id: 'regularidade-financeira',
    name: 'Regularidade Financeira',
    description: 'Quitação com a tesouraria do órgão de classe.',
    details:
      'Emitida pelo órgão de classe, dentro da data de validade, com a situação "quite com a tesouraria do conselho". Deve conter nome completo do profissional e número da inscrição.',
    icon: 'cash-check',
  },
  {
    id: 'certidao-etica',
    name: 'Certidão Ético-Profissional',
    description: 'Emitida pelo órgão de classe, dentro da validade.',
    details:
      'Emitida pelo órgão de classe. Deve apresentar data de validade e data de emissão (no TJPR é obrigatório estar dentro de 30 dias corridos). Não pode haver conduta disciplinar nos últimos 5 anos — 10 anos no caso do TJRJ. Conter nome completo do profissional e número da inscrição.',
    icon: 'shield-check-outline',
  },
  {
    id: 'diploma',
    name: 'Diploma',
    description: 'Graduação concluída, com registro autenticado no verso.',
    details:
      'Deve conter nome completo do profissional, nome da instituição de ensino, indicação da conclusão da graduação na área de atuação, data da colação/conclusão do curso e verso com o registro autenticado.',
    icon: 'school-outline',
  },
  {
    id: 'especializacoes',
    name: 'Certificado de Especializações',
    description: 'Se houver, com registro autenticado no verso.',
    details:
      'Quando houver, deve conter nome completo do profissional, nome da instituição de ensino ou hospital de residência médica, identificação da especialidade cursada e verso com o registro autenticado.',
    icon: 'certificate-outline',
  },
  {
    id: 'rqe',
    name: 'Certidão de RQE (exclusivo médicos)',
    description: 'Registro de Qualificação de Especialidade emitido pelo CRM.',
    details:
      'Exclusivo para médicos. Emitido junto ao CRM do Estado, com a indicação da qualificação (ex.: cardiologista, clínica médica, ortopedia e traumatologia, neurologia). Deve conter nome completo, número da inscrição, número do RQE, data de validade e data de emissão (TJPR considera apenas dentro de 30 dias corridos).',
    icon: 'medal-outline',
  },
  {
    id: 'nit',
    name: 'Comprovante NIT',
    description: 'Extrato de contribuição previdenciária.',
    details:
      'Obrigatoriamente o extrato de contribuição previdenciária — a CTPS digital e a física são rejeitadas. Precisa conter número do NIT, nome completo do profissional e CPF.',
    icon: 'card-text-outline',
  },
  {
    id: 'curriculo',
    name: 'Currículo',
    description: 'Experiência acadêmica e profissional do perito.',
    details:
      'Contém experiência acadêmica e profissional. Alteramos o número de telefone e e-mail para os do escritório. Aceitamos o currículo Lattes de forma geral — obrigatório para cadastro no TJAM e no TJFT.',
    icon: 'file-account-outline',
  },
  {
    id: 'bancarios',
    name: 'Comprovante de Dados Bancários',
    description: 'Conta em nome do perito titular.',
    details:
      'Precisa conter nome da instituição bancária, nome do perito como titular da conta, CPF, número da agência e número da conta bancária.',
    icon: 'bank-outline',
  },
  {
    id: 'foto',
    name: 'Foto Profissional',
    description: 'Foto utilizada para cadastro no TJSP e cartas.',
    details:
      'Utilizada para cadastro no TJSP e reaproveitada na carta de apresentação aos tribunais. Não há requisitos rígidos, mas pedimos que seja o mais profissional possível e transmita seriedade.',
    icon: 'account-box-outline',
  },
  {
    id: 'inscricao-municipal',
    name: 'Inscrição Municipal (TJMG e JT)',
    description: 'Exigido para TJMG e Justiça do Trabalho.',
    details:
      'Comprovante de inscrição municipal contendo: número da inscrição municipal, nome completo, número do CPF, situação ativa/regular e a atividade profissional desenvolvida.',
    icon: 'city-variant-outline',
  },
  {
    id: 'curso-pericia-tjrj',
    name: 'Curso em Perícia Judicial (TJRJ)',
    description: 'Certificado obrigatório para cadastro no TJRJ.',
    details:
      'Obrigatório que seja em perícia judicial (perícia médica é rejeitada). Carga horária mínima de 21h. Deve conter nome completo do profissional e data da conclusão.',
    icon: 'gavel',
  },
];

const INITIAL_FILES: Record<string, AttachedFile> = {
  'doc-pessoal': { uri: '', name: 'rg-frente-verso.pdf', mimeType: 'application/pdf', size: 245_000, isMock: true },
  cpf: { uri: '', name: 'comprovante-cpf-receita.pdf', mimeType: 'application/pdf', size: 182_400, isMock: true },
  residencia: { uri: '', name: 'conta-luz-marco.pdf', mimeType: 'application/pdf', size: 318_000, isMock: true },
  bancarios: { uri: '', name: 'comprovante-bancario.pdf', mimeType: 'application/pdf', size: 152_900, isMock: true },
};

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMime(mime?: string): boolean {
  return !!mime && mime.startsWith('image/');
}

function fileIconFor(file: AttachedFile): keyof typeof MaterialCommunityIcons.glyphMap {
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

  const handleBack = () => router.back();
  const handleNext = () => router.replace('/(tabs)');

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
    } catch (err) {
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

  const viewDoc = viewDocId
    ? DOCUMENTS.find((d) => d.id === viewDocId) ?? null
    : null;
  const viewFile = viewDocId ? files[viewDocId] : undefined;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backIcon}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastro</Text>
        <View style={styles.backIcon} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Dossiê Médico</Text>
          <Text style={styles.introSubtitle}>
            Complete seu perfil anexando os documentos obrigatórios. Você pode
            enviá-los em qualquer ordem — toque em cada item para ver o que é
            necessário.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text style={styles.progressCount}>
              {completed} de {total} concluídos
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

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
            <MaterialCommunityIcons name="robot-happy" size={26} color="#FFFFFF" />
            <View style={styles.helpAvatarDot} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpEyebrow}>ASSISTENTE IA</Text>
            <Text style={styles.helpTitle}>Tirar dúvidas com a Mia</Text>
            <Text style={styles.helpText}>
              Resposta em segundos sobre documentos, prazos e como emitir cada
              certidão.
            </Text>
          </View>
          <View style={styles.helpChevron}>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerSecondary}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color="#4AAFA6" />
          <Text style={styles.footerSecondaryText}>VOLTAR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.footerPrimary,
            !allComplete && styles.footerPrimaryDisabled,
          ]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!allComplete}
        >
          <Text style={styles.footerPrimaryText}>PRÓXIMO</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!detailsDoc}
        animationType="fade"
        transparent
        onRequestClose={() => setDetailsDoc(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDetailsDoc(null)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {detailsDoc && (
              <>
                <View style={styles.modalIconWrap}>
                  <MaterialCommunityIcons
                    name={detailsDoc.icon}
                    size={26}
                    color="#4AAFA6"
                  />
                </View>
                <Text style={styles.modalTitle}>{detailsDoc.name}</Text>
                <Text style={styles.modalDescription}>{detailsDoc.details}</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setDetailsDoc(null)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalCloseText}>Entendi</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!viewDoc && !!viewFile}
        animationType="fade"
        transparent
        onRequestClose={() => setViewDocId(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setViewDocId(null)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {viewDoc && viewFile && (
              <>
                <View style={styles.viewerHeaderRow}>
                  <Text style={styles.viewerLabel}>Arquivo anexado</Text>
                  <TouchableOpacity
                    onPress={() => setViewDocId(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={22} color="#687076" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTitle}>{viewDoc.name}</Text>

                {isImageMime(viewFile.mimeType) && viewFile.uri ? (
                  <View style={styles.previewImageWrap}>
                    <Image
                      source={{ uri: viewFile.uri }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.previewFileWrap}>
                    <MaterialCommunityIcons
                      name={fileIconFor(viewFile)}
                      size={42}
                      color="#4AAFA6"
                    />
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
                    <Text style={styles.fileMetaSize}>
                      {formatBytes(viewFile.size)}
                    </Text>
                  </View>
                </View>

                <View style={styles.viewerActions}>
                  <TouchableOpacity
                    style={styles.viewerSecondaryButton}
                    onPress={() => setViewDocId(null)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.viewerSecondaryText}>Fechar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewerDangerButton}
                    onPress={() => handleRemove(viewDoc.id)}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={16}
                      color="#C25A4A"
                    />
                    <Text style={styles.viewerDangerText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

type DocumentCardProps = {
  doc: DocItem;
  file?: AttachedFile;
  onAttach: () => void;
  onView: () => void;
  onInfo: () => void;
};

function DocumentCard({
  doc,
  file,
  onAttach,
  onView,
  onInfo,
}: DocumentCardProps) {
  const isAttached = !!file;

  return (
    <View style={styles.docCard}>
      <TouchableOpacity
        style={styles.docMain}
        activeOpacity={0.7}
        onPress={onInfo}
      >
        <View
          style={[
            styles.docIconWrap,
            isAttached && styles.docIconWrapVerified,
          ]}
        >
          {isAttached ? (
            <Ionicons name="checkmark-circle" size={26} color="#4AAFA6" />
          ) : (
            <MaterialCommunityIcons
              name={doc.icon}
              size={22}
              color="#4AAFA6"
            />
          )}
        </View>

        <View style={styles.docContent}>
          <Text style={styles.docName} numberOfLines={2}>
            {doc.name}
          </Text>
          <Text style={styles.docDescription} numberOfLines={2}>
            {doc.description}
          </Text>

          <View style={styles.docStatusRow}>
            {isAttached ? (
              <>
                <View style={styles.statusDotVerified} />
                <Text style={styles.statusVerified}>Anexado</Text>
              </>
            ) : (
              <>
                <View style={styles.statusDotPending} />
                <Text style={styles.statusPending}>Pendente envio</Text>
              </>
            )}
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
          <Ionicons name="eye-outline" size={18} color="#4AAFA6" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.docAction}
          activeOpacity={0.85}
          onPress={onAttach}
        >
          <MaterialCommunityIcons
            name="tray-arrow-up"
            size={16}
            color="#4AAFA6"
          />
          <Text style={styles.docActionText}>Anexar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F2',
  },
  header: {
    backgroundColor: '#4AAFA6',
    paddingTop: Platform.select({ ios: 56, android: 36, default: 14 }),
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  intro: {
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A3A36',
    marginBottom: 6,
  },
  introSubtitle: {
    fontSize: 13,
    color: '#687076',
    lineHeight: 19,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4AAFA6',
    letterSpacing: 0.4,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3A36',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8EDEF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4AAFA6',
    borderRadius: 3,
  },
  docsList: {
    gap: 10,
    marginBottom: 18,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  docMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docIconWrapVerified: {
    backgroundColor: 'transparent',
  },
  docContent: {
    flex: 1,
    paddingRight: 8,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A3A36',
    marginBottom: 3,
    lineHeight: 18,
  },
  docDescription: {
    fontSize: 12,
    color: '#687076',
    lineHeight: 16,
    marginBottom: 6,
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDotVerified: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4AAFA6',
    marginRight: 6,
  },
  statusDotPending: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E07A5F',
    marginRight: 6,
  },
  statusVerified: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4AAFA6',
    letterSpacing: 0.2,
  },
  statusPending: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E07A5F',
    letterSpacing: 0.2,
  },
  docAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B9DCD7',
    backgroundColor: '#F4FAF8',
    gap: 6,
  },
  docActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4AAFA6',
    letterSpacing: 0.3,
  },
  iconActionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B9DCD7',
    backgroundColor: '#F4FAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCard: {
    backgroundColor: '#2A8A7D',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2A8A7D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  helpAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
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
    backgroundColor: '#86E0A6',
    borderWidth: 2,
    borderColor: '#2A8A7D',
  },
  helpContent: {
    flex: 1,
    paddingRight: 8,
  },
  helpEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
  },
  helpChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E8EDEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 6,
  },
  footerSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  footerSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4AAFA6',
    letterSpacing: 0.5,
  },
  footerPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4AAFA6',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 6,
    shadowColor: '#4AAFA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  footerPrimaryDisabled: {
    backgroundColor: '#A8D4CF',
    shadowOpacity: 0,
    elevation: 0,
  },
  footerPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 36, 33, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EAF5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A3A36',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    color: '#445754',
    lineHeight: 19,
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#4AAFA6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  viewerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  viewerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4AAFA6',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  previewImageWrap: {
    height: 220,
    backgroundColor: '#F4FAF8',
    borderRadius: 14,
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
    backgroundColor: '#F4FAF8',
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  previewMockNote: {
    fontSize: 11,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 15,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  fileMetaInfo: {
    flex: 1,
  },
  fileMetaName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3A36',
    marginBottom: 2,
  },
  fileMetaSize: {
    fontSize: 11,
    color: '#687076',
  },
  viewerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewerSecondaryButton: {
    flex: 1,
    backgroundColor: '#F4FAF8',
    borderWidth: 1,
    borderColor: '#B9DCD7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewerSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4AAFA6',
    letterSpacing: 0.3,
  },
  viewerDangerButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FCF4F2',
    borderWidth: 1,
    borderColor: '#F3CFC8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  viewerDangerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C25A4A',
    letterSpacing: 0.3,
  },
});
