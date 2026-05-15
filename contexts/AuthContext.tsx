import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SignUpInput = {
  fullName: string;
  cpf: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

type AuthResult = { error: AuthError | null };

export type OnboardingStatus =
  | 'documents_incomplete'
  | 'documents_under_review'
  | 'documents_approved';

export type OnboardingState = {
  userId: string;
  status: OnboardingStatus;
  pendingCount: number;
  rejectedCount: number;
  underReviewCount: number;
  approvedCount: number;
  requiredTotal: number;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  onboarding: OnboardingState | null;
  onboardingStatus: OnboardingStatus | null;
  signIn: (input: SignInInput) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

type OnboardingRow = {
  profile_id: string;
  onboarding_status: OnboardingStatus;
  pending_count: number;
  rejected_count: number;
  under_review_count: number;
  approved_count: number;
  required_total: number;
};

function fallbackOnboarding(userId: string): OnboardingState {
  // Defensivo: se a view não retornou linha (erro transitório ou falha de
  // integridade), tratamos como onboarding incompleto. Pior caso: o usuário
  // vai parar na tela de documentos mesmo já estando aprovado — melhor que
  // travar o app em loading infinito.
  return {
    userId,
    status: 'documents_incomplete',
    pendingCount: 0,
    rejectedCount: 0,
    underReviewCount: 0,
    approvedCount: 0,
    requiredTotal: 0,
  };
}

async function fetchOnboardingFor(userId: string): Promise<OnboardingState> {
  const { data, error } = await supabase
    .from('profile_onboarding_status')
    .select(
      'profile_id, onboarding_status, pending_count, rejected_count, under_review_count, approved_count, required_total',
    )
    .eq('profile_id', userId)
    .maybeSingle<OnboardingRow>();

  if (error || !data) return fallbackOnboarding(userId);
  return {
    userId: data.profile_id,
    status: data.onboarding_status,
    pendingCount: data.pending_count,
    rejectedCount: data.rejected_count,
    underReviewCount: data.under_review_count,
    approvedCount: data.approved_count,
    requiredTotal: data.required_total,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const onboardingReqRef = useRef(0);

  const userId = session?.user?.id ?? null;

  const refreshOnboarding = useCallback(async () => {
    if (!userId) {
      setOnboarding(null);
      return;
    }
    const reqId = ++onboardingReqRef.current;
    setOnboardingLoading(true);
    try {
      const result = await fetchOnboardingFor(userId);
      if (onboardingReqRef.current !== reqId) return;
      setOnboarding(result);
    } finally {
      if (onboardingReqRef.current === reqId) {
        setOnboardingLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setBootstrapLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setOnboarding(null);
      return;
    }
    void refreshOnboarding();
  }, [userId, refreshOnboarding]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`profile_documents:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_documents',
          filter: `profile_id=eq.${userId}`,
        },
        () => {
          void refreshOnboarding();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refreshOnboarding]);

  const signIn = useCallback<AuthContextValue['signIn']>(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(
    async ({ fullName, cpf, email, password }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            cpf: onlyDigits(cpf),
          },
        },
      });
      return { error };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const onboardingReadyForSession =
    !userId || (onboarding !== null && onboarding.userId === userId);

  const loading = bootstrapLoading || !onboardingReadyForSession || onboardingLoading;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      onboarding,
      onboardingStatus: onboarding?.status ?? null,
      signIn,
      signUp,
      signOut,
      refreshOnboarding,
    }),
    [session, loading, onboarding, signIn, signUp, signOut, refreshOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
