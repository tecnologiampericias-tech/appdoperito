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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type DocStatus = 'verified' | 'pending' | 'signature';

type DocItem = {
  id: string;
  name: string;
  description: string;
  details: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  status: DocStatus;
};

const INITIAL_DOCUMENTS: DocItem[] = [
  {
    id: 'rg',
    name: 'Documento de Identidade (RG)',
    description: 'Documento oficial com foto, frente e verso legíveis.',
    details:
      'Envie uma foto nítida da frente e do verso do seu RG ou outro documento oficial com foto (CNH, passaporte). Aceitamos PDF, JPG ou PNG de até 10 MB por arquivo.',
    icon: 'card-account-details-outline',
    status: 'verified',
  },
  {
    id: 'cpf',
    name: 'CPF Regular',
    description: 'Cadastro de Pessoa Física regularizado na Receita Federal.',
    details:
      'Anexe o cartão CPF ou um comprovante de situação cadastral emitido em receita.fazenda.gov.br. A situação precisa estar "Regular".',
    icon: 'numeric',
    status: 'verified',
  },
  {
    id: 'residencia',
    name: 'Comprovante de Residência',
    description: 'Conta de luz, água, gás ou telefone dos últimos 90 dias.',
    details:
      'O comprovante deve conter seu nome completo e endereço atual, com data de emissão dentro dos últimos 90 dias.',
    icon: 'home-outline',
    status: 'verified',
  },
  {
    id: 'bancarios',
    name: 'Dados Bancários',
    description: 'Conta corrente em seu nome para pagamento dos honorários.',
    details:
      'Informe agência, conta corrente e banco em seu nome (CPF). Não aceitamos contas conjuntas em que você não seja o titular principal.',
    icon: 'bank-outline',
    status: 'verified',
  },
  {
    id: 'diploma',
    name: 'Diploma de Graduação',
    description: 'Diploma de Medicina expedido por instituição reconhecida pelo MEC.',
    details:
      'Diploma frente e verso ou certificado de conclusão acompanhado da apostila de registro. Deve constar o nome da instituição e a data de colação de grau.',
    icon: 'school-outline',
    status: 'pending',
  },
  {
    id: 'crm',
    name: 'Registro no CRM',
    description: 'Carteira ou certidão de registro ativo no Conselho Regional de Medicina.',
    details:
      'Carteira física, digital ou certidão de inscrição emitida pelo CRM do seu estado, com situação "ativo" e dentro da validade.',
    icon: 'badge-account-horizontal-outline',
    status: 'pending',
  },
  {
    id: 'rqe',
    name: 'Título de Especialista (RQE)',
    description: 'Registro de Qualificação de Especialista emitido pelo CRM.',
    details:
      'Documento que comprova sua especialidade médica reconhecida pelo CRM. Aceitamos o certificado da sociedade de especialidade junto com o RQE registrado.',
    icon: 'medal-outline',
    status: 'pending',
  },
  {
    id: 'certidao-crm',
    name: 'Certidão Negativa do CRM',
    description: 'Comprovante de inexistência de processos ético-profissionais.',
    details:
      'Solicite a certidão de ética no portal do CRM do seu estado. A validade aceita é de até 90 dias contados da emissão.',
    icon: 'shield-check-outline',
    status: 'pending',
  },
  {
    id: 'antecedentes-federal',
    name: 'Antecedentes Criminais (Federal)',
    description: 'Certidão emitida pela Justiça Federal, válida por 90 dias.',
    details:
      'Emita gratuitamente em pf.gov.br ou em portal.trf.jus.br. O arquivo precisa conter o QR code de validação e estar dentro da validade.',
    icon: 'gavel',
    status: 'pending',
  },
  {
    id: 'antecedentes-estadual',
    name: 'Antecedentes Criminais (Estadual)',
    description: 'Certidão emitida pela Justiça Estadual, válida por 90 dias.',
    details:
      'Emita no Tribunal de Justiça do seu estado. Caso tenha residido em mais de um estado nos últimos 5 anos, anexe uma certidão de cada UF.',
    icon: 'scale-balance',
    status: 'pending',
  },
  {
    id: 'vacina',
    name: 'Cartão de Vacina',
    description: 'Comprovante atualizado, incluindo hepatite B e tétano.',
    details:
      'Cartão completo ou Caderneta Digital do Conecte SUS. Vacinas obrigatórias: hepatite B (3 doses), dT/dTpa, tríplice viral e influenza vigente.',
    icon: 'needle',
    status: 'pending',
  },
  {
    id: 'aso',
    name: 'Exame Admissional (ASO)',
    description: 'Atestado de Saúde Ocupacional com validade de 12 meses.',
    details:
      'ASO emitido por médico do trabalho, atestando aptidão para a função de perito. O documento deve conter CRM e CNES da clínica emissora.',
    icon: 'clipboard-pulse-outline',
    status: 'pending',
  },
  {
    id: 'pis',
    name: 'PIS/PASEP',
    description: 'Número de inscrição PIS, PASEP ou NIT vinculado ao seu CPF.',
    details:
      'Pode ser consultado no app Carteira de Trabalho Digital ou no extrato da Caixa/Banco do Brasil. Envie a tela com o número visível.',
    icon: 'card-text-outline',
    status: 'pending',
  },
  {
    id: 'cnh',
    name: 'CNH (Categoria B ou superior)',
    description: 'Carteira Nacional de Habilitação vigente para deslocamentos.',
    details:
      'Necessária para perícias domiciliares e deslocamentos entre unidades. A CNH deve estar dentro da validade e em categoria B, AB, C, D ou E.',
    icon: 'car-outline',
    status: 'pending',
  },
  {
    id: 'foto',
    name: 'Foto 3x4 Recente',
    description: 'Fotografia profissional com fundo claro, dos últimos 6 meses.',
    details:
      'Foto frontal, rosto descoberto, fundo branco ou claro e vestimenta profissional. Será utilizada no crachá e em laudos periciais.',
    icon: 'account-box-outline',
    status: 'pending',
  },
  {
    id: 'termo',
    name: 'Termo de Consentimento',
    description: 'Declaração de ciência e concordância com as políticas da MPericias.',
    details:
      'O termo é assinado digitalmente no app, com validade jurídica via certificado ICP-Brasil. Você poderá baixar uma cópia após a assinatura.',
    icon: 'file-sign',
    status: 'signature',
  },
];

export default function DossieScreen() {
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCUMENTS);
  const [detailsDoc, setDetailsDoc] = useState<DocItem | null>(null);

  const total = docs.length;
  const completed = useMemo(
    () => docs.filter((d) => d.status === 'verified').length,
    [docs]
  );
  const progress = total === 0 ? 0 : completed / total;
  const allComplete = completed === total;

  const handleBack = () => router.back();

  const handleNext = () => {
    router.replace('/(tabs)');
  };

  const handleAttach = (id: string) => {
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: 'verified' } : doc
      )
    );
  };

  const handleSign = (id: string) => {
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: 'verified' } : doc
      )
    );
  };

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
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.docsList}>
          {docs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onAttach={() => handleAttach(doc.id)}
              onSign={() => handleSign(doc.id)}
              onInfo={() => setDetailsDoc(doc)}
            />
          ))}
        </View>

        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <View style={styles.helpIconWrap}>
              <Ionicons name="help-circle-outline" size={20} color="#4AAFA6" />
            </View>
            <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
          </View>
          <Text style={styles.helpText}>
            Nossa equipe de suporte está disponível para auxiliar no envio da
            sua documentação pericial.
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.helpLink}>Falar com Suporte</Text>
          </TouchableOpacity>
        </View>
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
                <Text style={styles.modalDescription}>
                  {detailsDoc.details}
                </Text>
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
    </View>
  );
}

type DocumentCardProps = {
  doc: DocItem;
  onAttach: () => void;
  onSign: () => void;
  onInfo: () => void;
};

function DocumentCard({ doc, onAttach, onSign, onInfo }: DocumentCardProps) {
  const isVerified = doc.status === 'verified';
  const isSignature = doc.status === 'signature';

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
            isVerified && styles.docIconWrapVerified,
          ]}
        >
          {isVerified ? (
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
            {isVerified ? (
              <>
                <View style={styles.statusDotVerified} />
                <Text style={styles.statusVerified}>Verificado</Text>
              </>
            ) : isSignature ? (
              <>
                <View style={styles.statusDotSignature} />
                <Text style={styles.statusSignature}>Requer assinatura</Text>
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

      {!isVerified && (
        <TouchableOpacity
          style={[
            styles.docAction,
            isSignature && styles.docActionSignature,
          ]}
          activeOpacity={0.85}
          onPress={isSignature ? onSign : onAttach}
        >
          <MaterialCommunityIcons
            name={isSignature ? 'draw-pen' : 'tray-arrow-up'}
            size={16}
            color="#4AAFA6"
          />
          <Text style={styles.docActionText}>
            {isSignature ? 'Assinar' : 'Anexar'}
          </Text>
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
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
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
  statusDotSignature: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4A04C',
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
  statusSignature: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4A04C',
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
  docActionSignature: {
    borderColor: '#E8D5A8',
    backgroundColor: '#FBF6EC',
  },
  docActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4AAFA6',
    letterSpacing: 0.3,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0EDEB',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A3A36',
  },
  helpText: {
    fontSize: 12,
    color: '#687076',
    lineHeight: 17,
    marginBottom: 8,
  },
  helpLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4AAFA6',
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
});
