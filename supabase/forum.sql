-- =====================================================================
-- Bolsão Alerta RJ · Fórum dos bolsões (Supabase / Postgres)
-- Rode este arquivo INTEIRO uma vez no SQL Editor do projeto Supabase.
--
-- Tudo o que importa para a segurança é conferido AQUI, no servidor:
-- quem pode postar, quem é moderador, banimento, silenciamento e o filtro
-- de palavras. O site repete o filtro só para avisar antes de enviar.
-- =====================================================================

create extension if not exists unaccent with schema extensions;
create schema if not exists private; -- funções internas (não ficam expostas na API)

-- ---------------------------------------------------------------------
-- Perfis: apelido público, sem nome real, e-mail ou telefone
-- ---------------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users on delete cascade,
  apelido text not null unique check (apelido ~ '^[A-Za-z0-9_.-]{3,24}$'),
  bairro text check (char_length(bairro) <= 40),
  papel text not null default 'usuario' check (papel in ('usuario', 'moderador', 'admin')),
  silenciado_ate timestamptz,
  banido boolean not null default false,
  criado_em timestamptz not null default now()
);

-- cria o perfil automaticamente quando alguém se cadastra
create function private.novo_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, apelido, bairro)
  values (new.id, new.raw_user_meta_data ->> 'apelido', nullif(new.raw_user_meta_data ->> 'bairro', ''));
  return new;
end $$;
create trigger ao_cadastrar after insert on auth.users
  for each row execute function private.novo_perfil();

-- ---------------------------------------------------------------------
-- Funções de permissão usadas pelas regras (RLS)
-- ---------------------------------------------------------------------
create function private.nivel(papel text) returns int language sql immutable as $$
  select case papel when 'admin' then 3 when 'moderador' then 2 else 1 end $$;

create function private.meu_papel() returns text
language sql stable security definer set search_path = '' as $$
  select papel from public.perfis where id = auth.uid() $$;

create function private.e_moderador() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(private.meu_papel() in ('moderador', 'admin'), false) $$;

-- pode postar = logado, não banido e não silenciado agora
create function private.pode_postar() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and not banido and (silenciado_ate is null or silenciado_ate < now())
  ) $$;

-- ---------------------------------------------------------------------
-- Filtro de palavras (mesma normalização de src/domain/filtroMensagens.js)
-- ---------------------------------------------------------------------
create table private.palavras_bloqueadas (palavra text primary key);

create function private.normalizar(t text) returns text
language sql stable set search_path = '' as $$
  select regexp_replace(
    regexp_replace(translate(lower(extensions.unaccent(coalesce(t, ''))), '4@3105$7', 'aaeiosst'), '[^a-z\s]', '', 'g'),
    '(.)\1+', '\1', 'g') $$;

insert into private.palavras_bloqueadas (palavra)
select private.normalizar(p) from unnest(array[
  'porra', 'caralho', 'merda', 'bosta', 'puta', 'puto', 'foda', 'foder', 'fodase', 'buceta',
  'arrombado', 'arrombada', 'desgracado', 'desgracada', 'otario', 'otaria', 'babaca', 'imbecil',
  'retardado', 'retardada', 'vagabundo', 'vagabunda', 'piranha', 'corno', 'cuzao', 'viado', 'escroto'
]) as p
on conflict do nothing;

create function private.tem_palavrao(t text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from private.palavras_bloqueadas b
    where b.palavra = any (regexp_split_to_array(private.normalizar(t), '\s+'))
  ) $$;

-- ---------------------------------------------------------------------
-- Tópicos (um por bolsão/ponto) e comentários
-- ---------------------------------------------------------------------
create table public.topicos (
  id bigint generated always as identity primary key,
  autor_id uuid not null default auth.uid() references public.perfis on delete cascade,
  via_id text not null check (char_length(via_id) <= 60),
  titulo text not null check (char_length(titulo) between 4 and 120),
  texto text not null check (char_length(texto) between 1 and 2000),
  profundidade_cm int check (profundidade_cm between 0 and 100),
  foto_path text,
  oculto boolean not null default false,
  motivo_oculto text, -- 'revisao' (link/telefone), 'denuncias' ou 'moderacao'
  criado_em timestamptz not null default now()
);

create table public.comentarios (
  id bigint generated always as identity primary key,
  topico_id bigint not null references public.topicos on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfis on delete cascade,
  texto text not null check (char_length(texto) between 1 and 1000),
  oculto boolean not null default false,
  motivo_oculto text,
  criado_em timestamptz not null default now()
);

create table public.denuncias (
  id bigint generated always as identity primary key,
  alvo_tipo text not null check (alvo_tipo in ('topico', 'comentario')),
  alvo_id bigint not null,
  autor_id uuid not null default auth.uid() references public.perfis on delete cascade,
  motivo text not null check (char_length(motivo) between 3 and 200),
  resolvida boolean not null default false,
  criado_em timestamptz not null default now(),
  unique (alvo_tipo, alvo_id, autor_id) -- cada pessoa denuncia uma vez
);
create index on public.denuncias (resolvida, alvo_tipo, alvo_id);
-- os demais índices (listas, revisão, busca de apelido) estão em supabase/indices.sql

-- filtro no servidor: bloqueia palavrão; link ou telefone vai para revisão
create function private.filtrar_conteudo() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  conteudo text;
begin
  conteudo := new.texto;
  if tg_table_name = 'topicos' then conteudo := new.titulo || ' ' || conteudo; end if;
  if private.tem_palavrao(conteudo) then
    raise exception 'BLOQUEADO: a mensagem tem palavras proibidas.' using errcode = '22023';
  end if;
  if conteudo ~* '(https?://|www\.|\.com\M|\.br\M|\d{4,5}-?\d{4})' then
    new.oculto := true;
    new.motivo_oculto := 'revisao';
  end if;
  return new;
end $$;
create trigger filtro before insert or update of texto on public.comentarios
  for each row execute function private.filtrar_conteudo();
create trigger filtro before insert or update of titulo, texto on public.topicos
  for each row execute function private.filtrar_conteudo();

-- 3 denúncias abertas escondem o conteúdo até um moderador revisar
create function private.contar_denuncias() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.denuncias
      where alvo_tipo = new.alvo_tipo and alvo_id = new.alvo_id and not resolvida) >= 3 then
    if new.alvo_tipo = 'topico' then
      update public.topicos set oculto = true, motivo_oculto = 'denuncias' where id = new.alvo_id;
    else
      update public.comentarios set oculto = true, motivo_oculto = 'denuncias' where id = new.alvo_id;
    end if;
  end if;
  return new;
end $$;
create trigger ao_denunciar after insert on public.denuncias
  for each row execute function private.contar_denuncias();

-- conteúdo apagado leva as denúncias junto
create function private.limpar_denuncias() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.denuncias
  where alvo_tipo = (case tg_table_name when 'topicos' then 'topico' else 'comentario' end) and alvo_id = old.id;
  return old;
end $$;
create trigger ao_apagar after delete on public.topicos for each row execute function private.limpar_denuncias();
create trigger ao_apagar after delete on public.comentarios for each row execute function private.limpar_denuncias();

-- ---------------------------------------------------------------------
-- Permissões por coluna + RLS
-- ---------------------------------------------------------------------
grant usage on schema private to anon, authenticated;
grant execute on all functions in schema private to anon, authenticated;

revoke all on public.perfis, public.topicos, public.comentarios, public.denuncias from anon, authenticated;
grant select on public.perfis, public.topicos, public.comentarios to anon, authenticated;
grant update (apelido, bairro) on public.perfis to authenticated;
grant insert (via_id, titulo, texto, profundidade_cm, foto_path) on public.topicos to authenticated;
grant update (titulo, texto, profundidade_cm) on public.topicos to authenticated;
grant insert (topico_id, texto) on public.comentarios to authenticated;
grant update (texto) on public.comentarios to authenticated;
grant delete on public.topicos, public.comentarios to authenticated;
grant select, insert (alvo_tipo, alvo_id, motivo) on public.denuncias to authenticated;

alter table public.perfis enable row level security;
alter table public.topicos enable row level security;
alter table public.comentarios enable row level security;
alter table public.denuncias enable row level security;

create policy "perfis visíveis" on public.perfis for select using (true);
create policy "editar o próprio perfil" on public.perfis for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "tópicos visíveis" on public.topicos for select
  using (not oculto or autor_id = auth.uid() or private.e_moderador());
create policy "postar tópico" on public.topicos for insert to authenticated
  with check (autor_id = auth.uid() and private.pode_postar());
create policy "editar o próprio tópico" on public.topicos for update to authenticated
  using (autor_id = auth.uid() and private.pode_postar()) with check (autor_id = auth.uid());
create policy "apagar tópico (autor ou moderador)" on public.topicos for delete to authenticated
  using (autor_id = auth.uid() or private.e_moderador());

create policy "comentários visíveis" on public.comentarios for select
  using (not oculto or autor_id = auth.uid() or private.e_moderador());
create policy "comentar" on public.comentarios for insert to authenticated
  with check (autor_id = auth.uid() and private.pode_postar());
create policy "editar o próprio comentário" on public.comentarios for update to authenticated
  using (autor_id = auth.uid() and private.pode_postar()) with check (autor_id = auth.uid());
create policy "apagar comentário (autor ou moderador)" on public.comentarios for delete to authenticated
  using (autor_id = auth.uid() or private.e_moderador());

create policy "denunciar" on public.denuncias for insert to authenticated
  with check (autor_id = auth.uid() and private.pode_postar());
create policy "moderador vê denúncias" on public.denuncias for select to authenticated
  using (private.e_moderador() or autor_id = auth.uid());

-- ---------------------------------------------------------------------
-- Ações de moderação (o papel de quem chama é conferido aqui dentro)
-- ---------------------------------------------------------------------
-- silenciar | liberar | banir | desbanir. Só age em quem tem papel MENOR.
create function public.moderar_usuario(alvo uuid, acao text, horas int default 24) returns void
language plpgsql security definer set search_path = '' as $$
declare
  papel_alvo text := (select papel from public.perfis where id = alvo);
begin
  if not private.e_moderador() then raise exception 'Apenas moderadores.'; end if;
  if private.nivel(papel_alvo) >= private.nivel(private.meu_papel()) then
    raise exception 'Você não pode moderar alguém do mesmo nível ou acima.';
  end if;
  case acao
    when 'silenciar' then update public.perfis set silenciado_ate = now() + make_interval(hours => greatest(horas, 1)) where id = alvo;
    when 'liberar'   then update public.perfis set silenciado_ate = null where id = alvo;
    when 'banir'     then update public.perfis set banido = true where id = alvo;
    when 'desbanir'  then update public.perfis set banido = false where id = alvo;
    else raise exception 'Ação desconhecida: %', acao;
  end case;
end $$;

-- só o administrador promove ou rebaixa moderadores
create function public.definir_papel(alvo uuid, novo text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if private.meu_papel() is distinct from 'admin' then raise exception 'Apenas administradores.'; end if;
  if alvo = auth.uid() then raise exception 'Você não pode mudar o próprio papel.'; end if;
  if novo not in ('usuario', 'moderador') then raise exception 'Papel inválido.'; end if;
  update public.perfis set papel = novo where id = alvo;
end $$;

-- restaurar | ocultar | remover_foto. Fecha as denúncias do item.
create function public.moderar_conteudo(tipo text, alvo bigint, acao text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.e_moderador() then raise exception 'Apenas moderadores.'; end if;
  if acao = 'remover_foto' and tipo = 'topico' then
    update public.topicos set foto_path = null where id = alvo;
  elsif acao in ('restaurar', 'ocultar') then
    if tipo = 'topico' then
      update public.topicos set oculto = (acao = 'ocultar'), motivo_oculto = case when acao = 'ocultar' then 'moderacao' end where id = alvo;
    else
      update public.comentarios set oculto = (acao = 'ocultar'), motivo_oculto = case when acao = 'ocultar' then 'moderacao' end where id = alvo;
    end if;
  else
    raise exception 'Ação desconhecida: %', acao;
  end if;
  update public.denuncias set resolvida = true where alvo_tipo = tipo and alvo_id = alvo;
end $$;

revoke execute on function public.moderar_usuario, public.definir_papel, public.moderar_conteudo from anon;

-- ---------------------------------------------------------------------
-- Fotos (Storage): leitura pública, envio só na própria pasta
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-forum', 'fotos-forum', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "enviar foto na própria pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos-forum' and (storage.foldername(name))[1] = auth.uid()::text and private.pode_postar());
create policy "apagar foto (dono ou moderador)" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos-forum' and ((storage.foldername(name))[1] = auth.uid()::text or private.e_moderador()));

-- ---------------------------------------------------------------------
-- Depois de criar a sua conta pelo site, torne-se administrador:
--   update public.perfis set papel = 'admin' where apelido = 'SEU_APELIDO';
-- ---------------------------------------------------------------------
