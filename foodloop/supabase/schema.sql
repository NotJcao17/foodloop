-- ============================================================
-- FoodLoop — Esquema completo + RLS + Triggers
-- Pegar en Supabase → SQL Editor → Run
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────
create type user_type      as enum ('student', 'cafeteria');
create type offer_type     as enum ('free', 'symbolic');
create type post_status    as enum ('available', 'claimed', 'delivered', 'expired');
create type claim_status   as enum ('active', 'cancelled');
create type notif_type     as enum ('claim', 'message', 'expiring_soon');

-- ──────────────────────────────────────────
-- TABLAS
-- ──────────────────────────────────────────

-- Perfiles (extiende auth.users 1-a-1)
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        varchar(100) not null,
  avatar_url  text,
  user_type   user_type not null default 'student',
  created_at  timestamptz default now()
);

-- Publicaciones
create table posts (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id) on delete cascade,
  title            varchar(120) not null,
  description      text,
  image_url        text not null,
  expiration_date  date not null,
  pickup_location  text not null,
  offer_type       offer_type not null default 'free',
  price_amount     numeric(8,2),
  status           post_status not null default 'available',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Reclamos (máximo 1 activo por post → UNIQUE en post_id)
create table claims (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null unique references posts(id) on delete cascade,
  claimer_id  uuid not null references profiles(id) on delete cascade,
  claimed_at  timestamptz default now(),
  status      claim_status not null default 'active'
);

-- Mensajes del chat de coordinación
create table messages (
  id         uuid primary key default uuid_generate_v4(),
  claim_id   uuid not null references claims(id) on delete cascade,
  sender_id  uuid not null references profiles(id) on delete cascade,
  content    text not null,
  sent_at    timestamptz default now()
);

-- Notificaciones in-app
create table notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references profiles(id) on delete cascade,
  type         notif_type not null,
  title        varchar(100) not null,
  body         text not null,
  read         boolean default false,
  reference_id uuid,
  created_at   timestamptz default now()
);

-- ──────────────────────────────────────────
-- TRIGGER: updated_at en posts
-- ──────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_updated_at
  before update on posts
  for each row execute function set_updated_at();

-- ──────────────────────────────────────────
-- TRIGGER: auto-crear profile al registrarse
-- ──────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'user_type')::user_type, 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ──────────────────────────────────────────
-- TRIGGER: al reclamar → cambiar estado post + notificar dueño
-- ──────────────────────────────────────────
create or replace function on_claim_created()
returns trigger language plpgsql security definer as $$
declare
  v_post_owner uuid;
  v_post_title text;
  v_claimer_name text;
begin
  -- Obtener dueño y título del post
  select user_id, title into v_post_owner, v_post_title
  from posts where id = new.post_id;

  -- Nombre del reclamante
  select name into v_claimer_name
  from profiles where id = new.claimer_id;

  -- Cambiar estado del post
  update posts set status = 'claimed' where id = new.post_id;

  -- Crear notificación para el dueño
  insert into notifications (user_id, type, title, body, reference_id)
  values (
    v_post_owner,
    'claim',
    '¡Alguien quiere tu alimento!',
    v_claimer_name || ' ha reclamado "' || v_post_title || '"',
    new.post_id
  );

  return new;
end;
$$;

create trigger on_claim_insert
  after insert on claims
  for each row execute function on_claim_created();

-- ──────────────────────────────────────────
-- TRIGGER: al enviar mensaje → notificar al otro participante
-- ──────────────────────────────────────────
create or replace function on_message_created()
returns trigger language plpgsql security definer as $$
declare
  v_post_owner  uuid;
  v_claimer     uuid;
  v_recipient   uuid;
  v_sender_name text;
  v_post_id     uuid;
begin
  select p.user_id, c.claimer_id, cl.post_id
  into v_post_owner, v_claimer, v_post_id
  from claims cl
  join posts p on p.id = cl.post_id
  join claims c on c.id = cl.id
  where cl.id = new.claim_id;

  select name into v_sender_name from profiles where id = new.sender_id;

  -- Notificar al otro participante
  if new.sender_id = v_post_owner then
    v_recipient := v_claimer;
  else
    v_recipient := v_post_owner;
  end if;

  insert into notifications (user_id, type, title, body, reference_id)
  values (
    v_recipient,
    'message',
    'Nuevo mensaje de ' || v_sender_name,
    left(new.content, 80),
    new.claim_id
  );

  return new;
end;
$$;

create trigger on_message_insert
  after insert on messages
  for each row execute function on_message_created();

-- ──────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────

alter table profiles     enable row level security;
alter table posts        enable row level security;
alter table claims       enable row level security;
alter table messages     enable row level security;
alter table notifications enable row level security;

-- Profiles
create policy "profiles_select" on profiles for select to authenticated using (true);
create policy "profiles_update" on profiles for update to authenticated using (auth.uid() = id);

-- Posts
create policy "posts_select" on posts for select to authenticated using (true);
create policy "posts_insert" on posts for insert to authenticated with check (auth.uid() = user_id);
create policy "posts_update" on posts for update to authenticated using (auth.uid() = user_id);
create policy "posts_delete" on posts for delete to authenticated using (auth.uid() = user_id);

-- Claims
create policy "claims_select" on claims for select to authenticated
  using (
    auth.uid() = claimer_id
    or auth.uid() = (select user_id from posts where id = post_id)
  );
create policy "claims_insert" on claims for insert to authenticated
  with check (
    auth.uid() = claimer_id
    and auth.uid() != (select user_id from posts where id = post_id)
    and (select status from posts where id = post_id) = 'available'
  );
create policy "claims_update" on claims for update to authenticated
  using (auth.uid() = claimer_id or auth.uid() = (select user_id from posts where id = post_id));

-- Messages
create policy "messages_select" on messages for select to authenticated
  using (
    auth.uid() = (select claimer_id from claims where id = claim_id)
    or auth.uid() = (select p.user_id from posts p join claims c on c.post_id = p.id where c.id = claim_id)
  );
create policy "messages_insert" on messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and (
      auth.uid() = (select claimer_id from claims where id = claim_id)
      or auth.uid() = (select p.user_id from posts p join claims c on c.post_id = p.id where c.id = claim_id)
    )
  );

-- Notifications
create policy "notifs_select" on notifications for select to authenticated using (auth.uid() = user_id);
create policy "notifs_update" on notifications for update to authenticated using (auth.uid() = user_id);

-- ──────────────────────────────────────────
-- REALTIME
-- ──────────────────────────────────────────
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table claims;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;

-- ──────────────────────────────────────────
-- STORAGE POLICIES (bucket: post-images)
-- ──────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "post_images_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'post-images');
create policy "post_images_select" on storage.objects for select
  using (bucket_id = 'post-images');
create policy "avatars_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');
create policy "avatars_select" on storage.objects for select
  using (bucket_id = 'avatars');
