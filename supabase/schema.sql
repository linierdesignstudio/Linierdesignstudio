create table if not exists public.client_projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique check (project_code ~ '^[A-Z0-9_-]{3,32}$'),
  project_name text not null,
  client_name text not null,
  location text not null default '',
  start_date date,
  status text not null default 'Berjalan',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  client_email text,
  client_login_salt text,
  client_login_hash text,
  password_salt text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_projects
  add column if not exists start_date date;

alter table public.client_projects
  add column if not exists client_email text;

alter table public.client_projects
  add column if not exists client_login_salt text;

alter table public.client_projects
  add column if not exists client_login_hash text;

with account_credentials as (
  select distinct on (client_email)
    client_email,
    case
      when client_login_salt is not null and client_login_hash is not null then client_login_salt
      else password_salt
    end as login_salt,
    case
      when client_login_salt is not null and client_login_hash is not null then client_login_hash
      else password_hash
    end as login_hash
  from public.client_projects
  where client_email is not null
  order by client_email,
    (client_login_salt is not null and client_login_hash is not null) desc,
    created_at asc,
    id asc
)
update public.client_projects as project
  set client_login_salt = account_credentials.login_salt,
      client_login_hash = account_credentials.login_hash
  from account_credentials
  where project.client_email = account_credentials.client_email
    and (
      project.client_login_salt is distinct from account_credentials.login_salt
      or project.client_login_hash is distinct from account_credentials.login_hash
    );

create index if not exists client_projects_client_email_idx
  on public.client_projects (client_email)
  where client_email is not null;

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
  credential_type text not null default 'project' check (credential_type in ('project', 'account')),
  whatsapp_number text not null,
  status text not null default 'pending' check (status in ('pending', 'processed')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.client_feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  subject text not null check (length(btrim(subject)) between 1 and 120),
  message text not null check (length(btrim(message)) between 1 and 5000),
  reply text check (reply is null or length(btrim(reply)) between 1 and 5000),
  replied_by text check (replied_by is null or replied_by in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  replied_at timestamptz
);

create index if not exists client_feedback_project_date_idx
  on public.client_feedback (project_id, created_at desc);

alter table public.project_password_reset_requests
  add column if not exists credential_type text not null default 'project'
  check (credential_type in ('project', 'account'));

drop index if exists public.project_password_reset_one_pending_idx;

create unique index project_password_reset_one_pending_idx
  on public.project_password_reset_requests (project_id, credential_type)
  where status = 'pending';

alter table public.client_projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_login_attempts enable row level security;
alter table public.project_password_reset_requests enable row level security;
alter table public.client_feedback enable row level security;

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

create or replace function public.portal_delete_project_update(
  p_update_id uuid
)
returns setof public.project_updates
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_project_id uuid;
  deleted_update public.project_updates;
  latest_progress integer;
begin
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

  if not found then
    raise exception 'Project not found';
  end if;

  delete from public.project_updates
    where id = p_update_id
    returning * into deleted_update;

  select progress_percent
    into latest_progress
    from public.project_updates
    where project_id = target_project_id
    order by update_date desc, created_at desc
    limit 1;

  latest_progress := coalesce(latest_progress, 0);

  update public.client_projects
    set progress_percent = latest_progress,
        status = case when latest_progress = 100 then 'Selesai' else 'Berjalan' end,
        updated_at = now()
    where id = target_project_id;

  return next deleted_update;
end;
$$;

create or replace function public.portal_delete_project(
  p_project_id uuid
)
returns table (
  project_id uuid,
  attachment_paths jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform 1
    from public.client_projects
    where id = p_project_id
    for update;

  if not found then
    return;
  end if;

  return query
    select p_project_id,
      coalesce(jsonb_agg(attachment.value ->> 'path'), '[]'::jsonb)
    from public.project_updates as project_update
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(project_update.attachments) = 'array' then project_update.attachments
        else '[]'::jsonb
      end
    ) as attachment(value)
    where project_update.project_id = p_project_id;

  delete from public.client_projects
    where id = p_project_id;
end;
$$;

drop function if exists public.portal_resolve_password_reset(uuid, text, text);

create function public.portal_resolve_password_reset(
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
  client_email text,
  credential_type text,
  whatsapp_number text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_project_id uuid;
  target_client_email text;
  target_credential_type text;
begin
  select reset_request.project_id, reset_request.credential_type
    into target_project_id, target_credential_type
    from public.project_password_reset_requests as reset_request
    where reset_request.id = p_request_id
      and reset_request.status = 'pending'
    for update;

  if not found then
    return;
  end if;

  if target_credential_type = 'account' then
    select client_email
      into target_client_email
      from public.client_projects
      where id = target_project_id
      for update;

    if target_client_email is null then
      raise exception 'Client email account not found';
    end if;

    update public.client_projects
      set client_login_salt = p_password_salt,
          client_login_hash = p_password_hash,
          updated_at = now()
      where client_email = target_client_email;
  else
    update public.client_projects
      set password_salt = p_password_salt,
          password_hash = p_password_hash,
          updated_at = now()
      where id = target_project_id;
  end if;

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
           project.client_email,
           reset_request.credential_type,
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
revoke all on function public.portal_delete_project_update(uuid) from public, anon, authenticated;
revoke all on function public.portal_resolve_password_reset(uuid, text, text) from public, anon, authenticated;
revoke all on function public.portal_change_client_password(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.portal_allow_login_attempt(uuid, boolean) to service_role;
grant execute on function public.portal_create_project_update(uuid, text, text, integer, date, jsonb) to service_role;
grant execute on function public.portal_update_project_update(uuid, text, text, integer, date, jsonb) to service_role;
grant execute on function public.portal_delete_project_update(uuid) to service_role;
grant execute on function public.portal_delete_project(uuid) to service_role;
grant execute on function public.portal_resolve_password_reset(uuid, text, text) to service_role;
grant execute on function public.portal_change_client_password(uuid, text, text, text, text) to service_role;

revoke all on public.client_projects, public.project_updates, public.project_login_attempts, public.project_password_reset_requests, public.client_feedback from anon, authenticated;
grant select, insert on public.client_projects to service_role;
grant select, insert, update, delete on public.project_updates to service_role;
grant select, insert, update, delete on public.project_login_attempts to service_role;
grant select, insert, update on public.project_password_reset_requests to service_role;
grant select, insert, update on public.client_feedback to service_role;
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
