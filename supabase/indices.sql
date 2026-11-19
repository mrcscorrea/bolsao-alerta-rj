-- =====================================================================
-- Índices para as consultas mais comuns do fórum.
-- Rode uma vez no SQL Editor do Supabase (pode rodar de novo sem erro).
-- Cada índice diz qual tela/consulta ele acelera.
-- =====================================================================

-- Lista do fórum: "mais novos primeiro", com ou sem filtro por ponto
create index if not exists topicos_criado_em_idx on public.topicos (criado_em desc);
create index if not exists topicos_via_criado_em_idx on public.topicos (via_id, criado_em desc);

-- Tópico aberto: comentários dele em ordem (substitui o índice só por topico_id)
create index if not exists comentarios_topico_criado_em_idx on public.comentarios (topico_id, criado_em);
drop index if exists public.comentarios_topico_id_idx;

-- Apagar conta/perfil em cascata e "posts deste autor"
create index if not exists topicos_autor_idx on public.topicos (autor_id);
create index if not exists comentarios_autor_idx on public.comentarios (autor_id);

-- Moderação > Em revisão (só as linhas em revisão entram no índice)
create index if not exists topicos_revisao_idx on public.topicos (criado_em) where motivo_oculto = 'revisao';
create index if not exists comentarios_revisao_idx on public.comentarios (criado_em) where motivo_oculto = 'revisao';

-- Moderação > Denúncias abertas, em ordem de chegada
create index if not exists denuncias_abertas_idx on public.denuncias (criado_em) where not resolvida;

-- Moderação > Usuários: lista por data e busca por pedaço do apelido (ilike '%texto%')
create extension if not exists pg_trgm with schema extensions;
create index if not exists perfis_criado_em_idx on public.perfis (criado_em desc);
create index if not exists perfis_apelido_trgm_idx on public.perfis using gin (apelido extensions.gin_trgm_ops);
