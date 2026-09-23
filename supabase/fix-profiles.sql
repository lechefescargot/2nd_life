-- =====================================================================
--  Correctif : "new row violates row-level security policy for table profiles"
--  À coller dans Supabase > SQL Editor > New query, puis "Run".
-- =====================================================================

-- 1) Supprime TOUTES les règles existantes sur profiles
--    (utile si le projet avait déjà une table "profiles" avec d'autres règles)
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'profiles' loop
    execute format('drop policy %I on public.profiles', p.policyname);
  end loop;
end $$;

-- 2) Recrée les bonnes règles
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated using (true);

create policy profiles_insert on public.profiles
  for insert to authenticated with check (id = auth.uid());

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles_public to anon, authenticated;

-- 3) Vérification : vous devez voir exactement 3 lignes
select policyname, cmd, roles, permissive from pg_policies
where schemaname = 'public' and tablename = 'profiles';
