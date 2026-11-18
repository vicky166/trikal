-- TRIKAL initial schema. Apply in the Supabase SQL editor, or with the Supabase CLI once Docker is installed.
-- The browser uses the anon key. The service role is never granted here.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  name text check (name is null or char_length(name) between 2 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.user_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  display_name text,
  language text not null default 'en' check (language in ('en', 'hi', 'hinglish')),
  notification_horoscope boolean not null default false,
  notification_guide boolean not null default false,
  timezone text not null default 'Asia/Kolkata'
);

create table public.user_preferences (
  user_id uuid primary key references public.users (id) on delete cascade,
  ayanamsa text not null default 'lahiri' check (ayanamsa in ('lahiri')),
  house_system text not null default 'whole-sign' check (house_system in ('whole-sign'))
);

create table public.birth_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 80),
  birth_date date not null check (birth_date >= date '1900-01-01' and birth_date <= current_date),
  birth_time time,
  time_precision text not null check (time_precision in ('exact', 'unknown')),
  city_label text not null,
  country_code text,
  time_zone text,
  latitude numeric(8, 5),
  longitude numeric(9, 5),
  location_source text not null default 'unresolved' check (location_source in ('gazetteer', 'geocoder', 'unresolved')),
  gender text not null default 'unspecified' check (gender in ('female', 'male', 'other', 'unspecified')),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint birth_time_matches_precision check (
    (time_precision = 'exact' and birth_time is not null)
    or (time_precision = 'unknown' and birth_time is null)
  ),
  constraint coordinates_together check (
    (latitude is null and longitude is null) or (latitude is not null and longitude is not null)
  )
);

create unique index birth_profiles_one_primary on public.birth_profiles (user_id) where is_primary;
create index birth_profiles_user_created on public.birth_profiles (user_id, created_at desc);

create table public.astrology_charts (
  id uuid primary key default gen_random_uuid(),
  birth_profile_id uuid not null references public.birth_profiles (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  engine text not null,
  engine_version text not null,
  ayanamsa text not null,
  ayanamsa_degrees numeric(8, 5) not null,
  house_system text not null,
  node_model text not null,
  instant_utc timestamptz not null,
  lagna_longitude numeric(8, 5),
  planets jsonb not null,
  dasha jsonb,
  calculated_at timestamptz not null default now(),
  unique (birth_profile_id, engine, engine_version, ayanamsa, house_system, node_model)
);

create index astrology_charts_user on public.astrology_charts (user_id, calculated_at desc);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  birth_profile_id uuid references public.birth_profiles (id) on delete set null,
  title text,
  language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_user on public.conversations (user_id, updated_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  body text not null,
  chart_id uuid references public.astrology_charts (id) on delete set null,
  prompt_version text,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

create index messages_conversation on public.messages (conversation_id, created_at);

create table public.horoscope_entries (
  id uuid primary key default gen_random_uuid(),
  rashi text not null,
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  period_start date not null,
  timezone text not null,
  language text not null,
  career text,
  love text,
  health text,
  finance text,
  general_life text,
  source text not null check (source in ('editor', 'model')),
  published_at timestamptz,
  unique (rashi, period, period_start, language)
);

create table public.astrology_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  birth_profile_id uuid not null references public.birth_profiles (id) on delete cascade,
  chart_id uuid not null references public.astrology_charts (id) on delete cascade,
  kind text not null check (kind in ('birth', 'career', 'marriage', 'relationship', 'finance', 'yearly')),
  title text not null,
  preview text,
  body text,
  created_at timestamptz not null default now()
);

create index astrology_reports_user on public.astrology_reports (user_id, created_at desc);

create table public.compatibility_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  first_profile_id uuid not null references public.birth_profiles (id) on delete cascade,
  second_profile_id uuid not null references public.birth_profiles (id) on delete cascade,
  scores jsonb not null,
  total_withheld boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan text not null check (plan in ('free', 'monthly', 'yearly')),
  status text not null check (status in ('active', 'grace', 'expired', 'cancelled')),
  provider text not null default 'none',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index subscriptions_user on public.subscriptions (user_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  report_id uuid references public.astrology_reports (id) on delete set null,
  amount_minor integer not null check (amount_minor >= 0),
  currency text not null,
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider_reference text,
  created_at timestamptz not null default now()
);

create table public.usage_limits (
  user_id uuid not null references public.users (id) on delete cascade,
  day date not null,
  guide_questions integer not null default 0 check (guide_questions >= 0),
  primary key (user_id, day)
);

create table public.saved_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  message_id uuid not null references public.messages (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  kind text not null check (kind in ('horoscope', 'guide')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user on public.notifications (user_id, created_at desc);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  kind text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated before update on public.users
for each row execute function public.set_updated_at();
create trigger birth_profiles_updated before update on public.birth_profiles
for each row execute function public.set_updated_at();
create trigger conversations_updated before update on public.conversations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, nullif(trim(coalesce(new.raw_user_meta_data->>'name', '')), ''));
  insert into public.user_profiles (user_id, display_name)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data->>'name', '')), ''));
  insert into public.user_preferences (user_id) values (new.id);
  insert into public.subscriptions (user_id, plan, status, provider) values (new.id, 'free', 'active', 'none');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from public.birth_profiles where user_id = auth.uid();
  delete from public.conversations where user_id = auth.uid();
  delete from public.notifications where user_id = auth.uid();
  delete from public.saved_insights where user_id = auth.uid();
  update public.users set deleted_at = now(), email = null where id = auth.uid();
  insert into public.audit_events (user_id, kind) values (auth.uid(), 'account_deletion_requested');
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.birth_profiles enable row level security;
alter table public.astrology_charts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.horoscope_entries enable row level security;
alter table public.astrology_reports enable row level security;
alter table public.compatibility_reports enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.usage_limits enable row level security;
alter table public.saved_insights enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_events enable row level security;

create policy users_own on public.users for select using (id = auth.uid());
create policy users_update_own on public.users for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_own on public.user_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy preferences_own on public.user_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy birth_own on public.birth_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy charts_read_own on public.astrology_charts for select using (user_id = auth.uid());
create policy conversations_own on public.conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy messages_own on public.messages for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy horoscope_read on public.horoscope_entries for select using (published_at is not null);
create policy reports_read_own on public.astrology_reports for select using (user_id = auth.uid());
create policy compatibility_own on public.compatibility_reports for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy subscriptions_read_own on public.subscriptions for select using (user_id = auth.uid());
create policy payments_read_own on public.payments for select using (user_id = auth.uid());
create policy usage_read_own on public.usage_limits for select using (user_id = auth.uid());
create policy insights_own on public.saved_insights for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_own on public.notifications for select using (user_id = auth.uid());
create policy notifications_update_own on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy audit_read_own on public.audit_events for select using (user_id = auth.uid());

-- No insert policy on astrology_charts, horoscope_entries, payments, usage_limits, or subscriptions.
-- A signed-in person cannot mark a payment paid or publish a horoscope.
