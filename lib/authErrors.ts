import type { AuthError, PostgrestError } from '@supabase/supabase-js';

export function getAuthErrorMessage(error: AuthError | PostgrestError | null): string {
  if (!error) return '';

  const code = 'code' in error ? error.code : undefined;
  const message = error.message ?? '';

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return 'E-mail ou senha incorretos.';
  }
  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  }
  if (code === 'user_already_exists' || /already registered|already exists/i.test(message)) {
    return 'Já existe uma conta com este e-mail.';
  }
  if (code === 'weak_password' || /password should be at least/i.test(message)) {
    return 'Senha muito fraca. Use ao menos 6 caracteres.';
  }
  if (code === 'over_email_send_rate_limit' || /rate limit/i.test(message)) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
  }
  if (code === '23505' || /duplicate key|profiles_cpf_unique/i.test(message)) {
    return 'Este CPF já está cadastrado.';
  }
  if (code === '23514' || /profiles_cpf_format/i.test(message)) {
    return 'CPF inválido.';
  }
  if (/network|fetch failed/i.test(message)) {
    return 'Sem conexão. Verifique sua internet e tente novamente.';
  }

  return message || 'Não foi possível concluir a operação. Tente novamente.';
}
