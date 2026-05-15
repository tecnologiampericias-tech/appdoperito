-- =====================================================================
-- 0006_add_ready_to_submit_enum.sql
-- Adiciona o status 'ready_to_submit' ao enum document_status.
--
-- Semântica do fluxo de upload:
--   pending          → o perito ainda não anexou arquivo
--   ready_to_submit  → arquivo anexado, AGUARDANDO o perito clicar em
--                      "Enviar para análise" para de fato submeter
--   under_review     → submetido oficialmente para análise do admin
--   approved/rejected → resultado da análise
--
-- ATENÇÃO: este arquivo precisa ficar isolado. Postgres não permite usar
-- um valor novo de enum dentro da mesma transação em que ele foi criado.
-- A migration 0007 já assume que este valor existe.
-- =====================================================================

alter type public.document_status add value if not exists 'ready_to_submit' before 'under_review';
