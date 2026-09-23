-- =====================================================================
--  Deuxième Vie — schéma Supabase
--  À coller dans Supabase > SQL Editor > New query, puis "Run".
--  Le script peut être relancé sans risque (idempotent).
-- =====================================================================

-- ---------- Tables ----------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 40),
  phone       text not null check (char_length(phone) between 8 and 20),
  whatsapp    boolean not null default true,
  commune     text not null default 'Cocody',
  role        text not null default 'les-deux' check (role in ('vendeur','acheteur','les-deux')),
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.listings (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.profiles(id) on delete cascade,
  title           text not null check (char_length(title) between 3 and 70),
  category        text not null default 'autre',
  condition       text not null default 'bon',
  type            text not null default 'vente' check (type in ('vente','don')),
  price           integer not null default 0 check (price >= 0),
  negotiable      boolean not null default false,
  description     text not null default '' check (char_length(description) <= 1200),
  commune         text not null,
  quartier        text not null default '',
  landmark        text not null default '',
  status          text not null default 'disponible' check (status in ('disponible','reserve','parti')),
  photos          text[] not null default '{}',
  thumb           text,
  hidden          boolean not null default false,
  view_count      integer not null default 0,
  interest_count  integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  confirmed_at    timestamptz not null default now()
);
create index if not exists listings_created_idx on public.listings (created_at desc);
create index if not exists listings_seller_idx  on public.listings (seller_id);

-- Une ligne par visiteur unique et par annonce (compteur "œil")
create table if not exists public.listing_views (
  listing_id   uuid not null references public.listings(id) on delete cascade,
  visitor_key  text not null,
  created_at   timestamptz not null default now(),
  primary key (listing_id, visitor_key)
);

create table if not exists public.interests (
  listing_id  uuid not null references public.listings(id) on delete cascade,
  buyer_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (listing_id, buyer_id)
);

-- Profil public (sans téléphone) lisible par les invités
create or replace view public.profiles_public as
  select id, name, created_at from public.profiles;
grant select on public.profiles_public to anon, authenticated;

-- ---------- Fonctions utilitaires ------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- Empêche un membre de se nommer admin lui-même
create or replace function public.profiles_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;            -- SQL Editor / service role
  if tg_op = 'INSERT' then
    new.is_admin := false; new.created_at := now(); return new;
  end if;
  if new.is_admin is distinct from old.is_admin and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  new.created_at := old.created_at;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before insert or update on public.profiles
  for each row execute function public.profiles_guard();

-- Protège les compteurs, le vendeur et le masquage admin
create or replace function public.listings_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('app.counter', true), '') = 'on' then return new; end if;
  if tg_op = 'INSERT' then
    new.view_count := 0; new.interest_count := 0;
    new.created_at := now(); new.updated_at := now();
    if not public.is_admin() then new.hidden := false; end if;
    return new;
  end if;
  new.view_count := old.view_count;
  new.interest_count := old.interest_count;
  new.seller_id := old.seller_id;
  new.created_at := old.created_at;
  if new.hidden is distinct from old.hidden and auth.uid() is not null and not public.is_admin() then
    new.hidden := old.hidden;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists listings_guard on public.listings;
create trigger listings_guard before insert or update on public.listings
  for each row execute function public.listings_guard();

-- Enregistre une vue unique ; renvoie true si c'est une nouvelle vue
create or replace function public.record_view(p_listing uuid, p_visitor text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_key text; v_seller uuid; n int;
begin
  select seller_id into v_seller from public.listings where id = p_listing;
  if v_seller is null then return false; end if;
  if auth.uid() is not null then
    if auth.uid() = v_seller then return false; end if;
    v_key := 'u:' || auth.uid();
  else
    if p_visitor is null or char_length(p_visitor) not between 8 and 64 then return false; end if;
    v_key := 'g:' || p_visitor;
  end if;
  insert into public.listing_views (listing_id, visitor_key) values (p_listing, v_key)
    on conflict do nothing;
  get diagnostics n = row_count;
  if n > 0 then
    perform set_config('app.counter', 'on', true);
    update public.listings set view_count = view_count + 1 where id = p_listing;
    perform set_config('app.counter', 'off', true);
    return true;
  end if;
  return false;
end $$;
grant execute on function public.record_view(uuid, text) to anon, authenticated;

-- Tient à jour le nombre d'intéressés
create or replace function public.interests_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.counter', 'on', true);
  if tg_op = 'INSERT' then
    update public.listings set interest_count = interest_count + 1 where id = new.listing_id;
  else
    update public.listings set interest_count = greatest(interest_count - 1, 0) where id = old.listing_id;
  end if;
  perform set_config('app.counter', 'off', true);
  return null;
end $$;
drop trigger if exists interests_count on public.interests;
create trigger interests_count after insert or delete on public.interests
  for each row execute function public.interests_count();

-- ---------- Sécurité (Row Level Security) ----------------------------
alter table public.profiles      enable row level security;
alter table public.listings      enable row level security;
alter table public.listing_views enable row level security;   -- aucun accès direct
alter table public.interests     enable row level security;

-- Profils : lisibles par les membres connectés (téléphone inclus)
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (true);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- Annonces : visibles par tous (sauf masquées), gérées par le vendeur ou l'admin
drop policy if exists listings_select on public.listings;
create policy listings_select on public.listings for select to anon, authenticated
  using (hidden = false or seller_id = auth.uid() or public.is_admin());
drop policy if exists listings_insert on public.listings;
create policy listings_insert on public.listings for insert to authenticated
  with check (seller_id = auth.uid() and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('vendeur','les-deux')));
drop policy if exists listings_update on public.listings;
create policy listings_update on public.listings for update to authenticated
  using (seller_id = auth.uid() or public.is_admin());
drop policy if exists listings_delete on public.listings;
create policy listings_delete on public.listings for delete to authenticated
  using (seller_id = auth.uid() or public.is_admin());

-- Intérêts : l'acheteur gère les siens ; le vendeur voit qui s'intéresse à ses annonces
drop policy if exists interests_select on public.interests;
create policy interests_select on public.interests for select to authenticated using (
  buyer_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid()));
drop policy if exists interests_insert on public.interests;
create policy interests_insert on public.interests for insert to authenticated
  with check (buyer_id = auth.uid());
drop policy if exists interests_delete on public.interests;
create policy interests_delete on public.interests for delete to authenticated
  using (buyer_id = auth.uid());

-- ---------- Stockage des photos --------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists photos_select on storage.objects;
create policy photos_select on storage.objects for select to anon, authenticated
  using (bucket_id = 'photos');
drop policy if exists photos_insert on storage.objects;
create policy photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists photos_delete on storage.objects;
create policy photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- Devenir administrateur -----------------------------------
-- Après avoir créé VOTRE compte sur le site, exécutez (avec votre email) :
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'votre@email.com');
