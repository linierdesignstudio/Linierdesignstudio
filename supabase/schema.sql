create table if not exists public.client_projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique check (project_code ~ '^[A-Z0-9_-]{3,32}$'),
  project_name text not null,
  client_name text not null,
  location text not null default '',
  start_date date,
  status text not null default 'Berjalan',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  password_salt text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_projects
  add column if not exists start_date date;

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  title text not null,
  description text not null,
  progress_percent integer not null check (progress_percent between 0 and 100),
  update_date date not null default current_date,
  created_at timestamptz not null default now(),
  attachments jsonb not null default '[]'::jsonb
);

alter table public.project_updates
  add column if not exists attachments jsonb not null default '[]'::jsonb;

create index if not exists project_updates_project_date_idx
  on public.project_updates (project_id, update_date desc, created_at desc);

create table if not exists public.project_login_attempts (
  project_id uuid primary key references public.client_projects(id) on delete cascade,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now()
);

create table if not exists public.project_password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  whatsapp_number text not null,
  status text not null default 'pending' check (status in ('pending', 'processed')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create unique index if not exists project_password_reset_one_pending_idx
  on public.project_password_reset_requests (project_id)
  where status = 'pending';

alter table public.client_projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_login_attempts enable row level security;
alter table public.project_password_reset_requests enable row level security;

create or replace function public.portal_allow_login_attempt(
  p_project_id uuid,
  p_success boolean
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_attempts integer;
  current_window timestamptz;
begin
  insert into public.project_login_attempts (project_id)
  values (p_project_id)
  on conflict (project_id) do nothing;

  select attempts, window_started_at
    into current_attempts, current_window
    from public.project_login_attempts
    where project_id = p_project_id
    for update;

  if current_window < now() - interval '15 minutes' then
    update public.project_login_attempts
      set attempts = 0, window_started_at = now()
      where project_id = p_project_id;
    current_attempts := 0;
  end if;

  if p_success then
    delete from public.project_login_attempts where project_id = p_project_id;
    return true;
  end if;

  if current_attempts >= 10 then
    return false;
  end if;

  update public.project_login_attempts
    set attempts = attempts + 1
    where project_id = p_project_id;
  return true;
end;
$$;

drop function if exists public.portal_create_project_update(uuid, text, text, integer, date);

create or replace function public.portal_create_project_update(
  p_project_id uuid,
  p_title text,
  p_description text,
  p_progress_percent integer,
  p_update_date date,
  p_attachments jsonb default '[]'::jsonb
)
returns setof public.project_updates
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_progress_percent < 0 or p_progress_percent > 100 then
    raise exception 'Progress must be between 0 and 100';
  end if;

  update public.client_projects
    set progress_percent = p_progress_percent,
        status = case when p_progress_percent = 100 then 'Selesai' else 'Berjalan' end,
        updated_at = now()
    where id = p_project_id;

  if not found then
    raise exception 'Project not found';
  end if;

  return query
    insert into public.project_updates (
      project_id, title, description, progress_percent, update_date, attachments
    )
    values (
      p_project_id, p_title, p_description, p_progress_percent, p_update_date, p_attachments
    )
    returning *;
end;
$$;

create or replace function public.portal_update_project_update(
  p_update_id uuid,
  p_title text,
  p_description text,
  p_progress_percent integer,
  p_update_date date,
  p_attachments jsonb default '[]'::jsonb
)
returns setof public.project_updates
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_project_id uuid;
  latest_progress integer;
begin
  if p_progress_percent < 0 or p_progress_percent > 100 then
    raise exception 'Progress must be between 0 and 100';
  end if;

  select project_id
    into target_project_id
    from public.project_updates
    where id = p_update_id
    for update;

  if not found then
    raise exception 'Update not found';
  end if;

  perform 1
    from public.client_projects
    where id = target_project_id
    for update;

  update public.project_updates
    set title = p_title,
        description = p_description,
        progress_percent = p_progress_percent,
        update_date = p_update_date,
        attachments = p_attachments
    where id = p_update_id;

  return query
    select *
      from public.project_updates
      where id = p_update_id;

  select progress_percent
    into latest_progress
    from public.project_updates
    where project_id = target_project_id
    order by update_date desc, created_at desc
    limit 1;

  update public.client_projects
    set progress_percent = latest_progress,
        status = case when latest_progress = 100 then 'Selesai' else 'Berjalan' end,
        updated_at = now()
    where id = target_project_id;
end;
$$;

create or replace function public.portal_resolve_password_reset(
  p_request_id uuid,
  p_password_salt text,
  p_password_hash text
)
returns table (
  request_id uuid,
  project_id uuid,
  project_code text,
  project_name text,
  client_name text,
  whatsapp_number text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_project_id uuid;
begin
  select reset_request.project_id
    into target_project_id
    from public.project_password_reset_requests as reset_request
    where reset_request.id = p_request_id
      and reset_request.status = 'pending'
    for update;

  if not found then
    return;
  end if;

  update public.client_projects
    set password_salt = p_password_salt,
        password_hash = p_password_hash,
        updated_at = now()
    where id = target_project_id;

  update public.project_password_reset_requests
    set status = 'processed',
        processed_at = now()
    where id = p_request_id;

  return query
    select reset_request.id,
           project.id,
           project.project_code,
           project.project_name,
           project.client_name,
           reset_request.whatsapp_number
      from public.project_password_reset_requests as reset_request
      join public.client_projects as project on project.id = reset_request.project_id
      where reset_request.id = p_request_id;
end;
$$;

create or replace function public.portal_change_client_password(
  p_project_id uuid,
  p_current_password_salt text,
  p_current_password_hash text,
  p_new_password_salt text,
  p_new_password_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.client_projects
    set password_salt = p_new_password_salt,
        password_hash = p_new_password_hash,
        updated_at = now()
    where id = p_project_id
      and password_salt = p_current_password_salt
      and password_hash = p_current_password_hash;

  return found;
end;
$$;

revoke all on function public.portal_allow_login_attempt(uuid, boolean) from public, anon, authenticated;
revoke all on function public.portal_create_project_update(uuid, text, text, integer, date, jsonb) from public, anon, authenticated;
revoke all on function public.portal_update_project_update(uuid, text, text, integer, date, jsonb) from public, anon, authenticated;
revoke all on function public.portal_resolve_password_reset(uuid, text, text) from public, anon, authenticated;
revoke all on function public.portal_change_client_password(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.portal_allow_login_attempt(uuid, boolean) to service_role;
grant execute on function public.portal_create_project_update(uuid, text, text, integer, date, jsonb) to service_role;
grant execute on function public.portal_update_project_update(uuid, text, text, integer, date, jsonb) to service_role;
grant execute on function public.portal_resolve_password_reset(uuid, text, text) to service_role;
grant execute on function public.portal_change_client_password(uuid, text, text, text, text) to service_role;

revoke all on public.client_projects, public.project_updates, public.project_login_attempts, public.project_password_reset_requests from anon, authenticated;
grant select, insert on public.client_projects to service_role;
grant select, insert, update, delete on public.project_updates to service_role;
grant select, insert, update, delete on public.project_login_attempts to service_role;
grant select, insert, update on public.project_password_reset_requests to service_role;
grant update on public.client_projects to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-progress',
  'portal-progress',
  false,
  20971520,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
