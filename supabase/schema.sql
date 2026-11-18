create table if not exists public.client_projects (
  id uuid primary key default gen_random_uuid(),
  project_code text not null unique check (project_code ~ '^[A-Z0-9_-]{3,32}$'),
  project_name text not null,
  client_name text not null,
  project_type text,
  client_phone text not null default '',
  location text not null default '',
  start_date date,
  status text not null default 'Berjalan',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  client_email text,
  client_profile_name text,
  client_last_login_at timestamptz,
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
  add column if not exists project_type text;

alter table public.client_projects
  add column if not exists client_phone text not null default '';

alter table public.client_projects
  add column if not exists client_email text;

alter table public.client_projects
  add column if not exists client_profile_name text;

alter table public.client_projects
  add column if not exists client_last_login_at timestamptz;

with account_profile_names as (
  select distinct on (client_email)
    client_email,
    client_name as profile_name
  from public.client_projects
  where client_email is not null
  order by client_email, created_at asc, id asc
)
update public.client_projects as project
  set client_profile_name = account_profile_names.profile_name
  from account_profile_names
  where project.client_email = account_profile_names.client_email
    and project.client_profile_name is null;

update public.client_projects
  set client_profile_name = client_name
  where client_profile_name is null;

create table if not exists public.portal_client_sessions (
  id uuid primary key,
  account_key text not null,
  client_email text,
  project_id uuid references public.client_projects(id) on delete cascade,
  ip_address text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists portal_client_sessions_account_activity_idx
  on public.portal_client_sessions (account_key, last_active_at desc)
  where revoked_at is null;

create table if not exists public.portal_project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  category text not null default 'other' check (category in ('contract', 'other')),
  path text not null unique,
  name text not null check (length(btrim(name)) between 1 and 120),
  content_type text not null,
  size bigint not null check (size between 1 and 20971520),
  created_at timestamptz not null default now()
);

create index if not exists portal_project_documents_project_created_idx
  on public.portal_project_documents (project_id, created_at desc);

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

create table if not exists public.project_billing_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 120),
  amount numeric(16, 0) not null check (amount > 0 and amount <= 9007199254740991),
  due_date date not null,
  status text not null default 'unpaid'
    check (status in ('unpaid', 'uploading', 'pending_review', 'rejected', 'paid')),
  selected_bank_code text,
  payment_proof_path text,
  payment_proof_name text,
  payment_proof_content_type text,
  proof_upload_expires_at timestamptz,
  payment_proof_submitted_at timestamptz,
  payment_review_note text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.project_billing_items
  add column if not exists selected_bank_code text;

create index if not exists project_billing_items_project_due_idx
  on public.project_billing_items (project_id, due_date, created_at);

create sequence if not exists public.portal_invoice_number_seq;

create table if not exists public.portal_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  billing_item_id uuid unique references public.project_billing_items(id) on delete set null,
  project_id uuid not null references public.client_projects(id) on delete cascade,
  issued_at timestamptz not null default now(),
  paid_at timestamptz not null,
  issuer_name text not null,
  issuer_address text not null,
  issuer_email text not null,
  client_name text not null,
  client_email text,
  client_phone text not null default '',
  project_name text not null,
  project_code text not null,
  project_location text not null default '',
  description text not null,
  amount numeric(16, 0) not null check (amount > 0),
  payment_bank_code text
);

create index if not exists portal_invoices_project_issued_idx
  on public.portal_invoices (project_id, issued_at desc);

create table if not exists public.portal_payment_settings (
  id text primary key default 'global' check (id = 'global'),
  bank_name text not null default '' check (length(bank_name) <= 80),
  account_number text not null default '' check (length(account_number) <= 64),
  account_holder text not null default '' check (length(account_holder) <= 120),
  bank_logo_path text,
  updated_at timestamptz not null default now()
);

alter table public.portal_payment_settings enable row level security;

insert into public.portal_payment_settings (id)
values ('global')
on conflict (id) do nothing;

create table if not exists public.portal_payment_accounts (
  bank_code text primary key check (bank_code in ('BCA', 'Mandiri', 'BNI', 'BRI')),
  account_number text not null default '' check (length(account_number) <= 64),
  account_holder text not null default '' check (length(account_holder) <= 120),
  updated_at timestamptz not null default now()
);

insert into public.portal_payment_accounts (bank_code, account_number, account_holder, updated_at)
select
  case
    when lower(btrim(bank_name)) in ('bca', 'bank bca', 'bank central asia') then 'BCA'
    when lower(btrim(bank_name)) in ('mandiri', 'bank mandiri') then 'Mandiri'
    when lower(btrim(bank_name)) in ('bni', 'bank bni', 'bank negara indonesia') then 'BNI'
    when lower(btrim(bank_name)) in ('bri', 'bank bri', 'bank rakyat indonesia') then 'BRI'
  end,
  account_number,
  account_holder,
  updated_at
from public.portal_payment_settings
where id = 'global'
  and (account_number <> '' or account_holder <> '')
  and lower(btrim(bank_name)) in (
    'bca', 'bank bca', 'bank central asia',
    'mandiri', 'bank mandiri',
    'bni', 'bank bni', 'bank negara indonesia',
    'bri', 'bank bri', 'bank rakyat indonesia'
  )
on conflict (bank_code) do nothing;

insert into public.portal_payment_accounts (bank_code)
values ('BCA'), ('Mandiri'), ('BNI'), ('BRI')
on conflict (bank_code) do nothing;

alter table public.portal_payment_accounts enable row level security;

create table if not exists public.project_change_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 120),
  description text not null check (length(btrim(description)) between 1 and 5000),
  requested_by text not null check (requested_by in ('client', 'admin')),
  cost_impact numeric(16, 0) not null default 0
    check (cost_impact between -9007199254740991 and 9007199254740991),
  schedule_impact_days integer not null default 0
    check (schedule_impact_days between -3650 and 3650),
  status text not null default 'requested'
    check (status in ('requested', 'pending_approval', 'approved', 'rejected')),
  admin_note text,
  client_response_note text,
  created_at timestamptz not null default now(),
  proposed_at timestamptz,
  responded_at timestamptz
);

create index if not exists project_change_orders_project_created_idx
  on public.project_change_orders (project_id, created_at desc);

create table if not exists public.portal_notifications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  audience text not null check (audience in ('admin', 'client')),
  event_type text not null check (event_type in (
    'project_update',
    'project_update_edited',
    'feedback_received',
    'feedback_replied',
    'billing_created',
    'payment_review',
    'payment_paid',
    'payment_rejected',
    'change_requested',
    'change_proposed',
    'change_decided'
  )),
  entity_id uuid not null,
  summary text not null,
  action_required boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  resolved_at timestamptz
);

create index if not exists portal_notifications_audience_date_idx
  on public.portal_notifications (audience, created_at desc);

create index if not exists portal_notifications_project_date_idx
  on public.portal_notifications (audience, project_id, created_at desc);

create index if not exists portal_notifications_open_actions_idx
  on public.portal_notifications (audience, project_id, created_at desc)
  where action_required and resolved_at is null;

create or replace function public.portal_emit_notification(
  p_project_id uuid,
  p_audience text,
  p_event_type text,
  p_entity_id uuid,
  p_summary text,
  p_action_required boolean default false
)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.portal_notifications (
    project_id, audience, event_type, entity_id, summary, action_required
  )
  values (
    p_project_id, p_audience, p_event_type, p_entity_id, p_summary, p_action_required
  );
$$;

create or replace function public.portal_resolve_notifications(
  p_project_id uuid,
  p_audience text,
  p_entity_id uuid,
  p_event_types text[]
)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.portal_notifications
    set action_required = false,
        resolved_at = coalesce(resolved_at, now())
    where project_id = p_project_id
      and audience = p_audience
      and entity_id = p_entity_id
      and event_type = any(p_event_types)
      and action_required
      and resolved_at is null;
$$;

create or replace function public.portal_notify_project_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.portal_emit_notification(
    new.project_id, 'client', 'project_update', new.id, new.title
  );
  return new;
end;
$$;

create or replace function public.portal_notify_project_update_edited()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.progress_percent is distinct from old.progress_percent
    or new.update_date is distinct from old.update_date
    or new.attachments is distinct from old.attachments then
    perform public.portal_emit_notification(
      new.project_id, 'client', 'project_update_edited', new.id, new.title
    );
  end if;
  return new;
end;
$$;

create or replace function public.portal_notify_feedback_created()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.portal_emit_notification(
    new.project_id, 'admin', 'feedback_received', new.id, new.subject, true
  );
  return new;
end;
$$;

create or replace function public.portal_notify_feedback_replied()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.replied_at is not null and new.replied_at is distinct from old.replied_at then
    perform public.portal_resolve_notifications(
      new.project_id, 'admin', new.id, array['feedback_received']
    );
    perform public.portal_emit_notification(
      new.project_id, 'client', 'feedback_replied', new.id, new.subject
    );
  end if;
  return new;
end;
$$;

create or replace function public.portal_notify_billing_created()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.portal_emit_notification(
    new.project_id, 'client', 'billing_created', new.id, new.title, true
  );
  return new;
end;
$$;

create or replace function public.portal_notify_billing_status()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'pending_review' then
    perform public.portal_resolve_notifications(
      new.project_id, 'client', new.id, array['billing_created', 'payment_rejected']
    );
    perform public.portal_emit_notification(
      new.project_id, 'admin', 'payment_review', new.id, new.title, true
    );
  elsif new.status = 'paid' then
    perform public.portal_resolve_notifications(
      new.project_id, 'admin', new.id, array['payment_review']
    );
    perform public.portal_resolve_notifications(
      new.project_id, 'client', new.id, array['billing_created', 'payment_rejected']
    );
    perform public.portal_emit_notification(
      new.project_id, 'client', 'payment_paid', new.id, new.title
    );
  elsif new.status = 'rejected' then
    perform public.portal_resolve_notifications(
      new.project_id, 'admin', new.id, array['payment_review']
    );
    perform public.portal_resolve_notifications(
      new.project_id, 'client', new.id, array['billing_created', 'payment_rejected']
    );
    perform public.portal_emit_notification(
      new.project_id, 'client', 'payment_rejected', new.id, new.title, true
    );
  elsif new.status = 'unpaid' and old.status = 'uploading' then
    perform public.portal_emit_notification(
      new.project_id, 'client', 'billing_created', new.id, new.title, true
    );
  end if;

  return new;
end;
$$;

create or replace function public.portal_notify_change_order_created()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.requested_by = 'client' then
    perform public.portal_emit_notification(
      new.project_id, 'admin', 'change_requested', new.id, new.title, true
    );
  elsif new.status = 'pending_approval' then
    perform public.portal_emit_notification(
      new.project_id, 'client', 'change_proposed', new.id, new.title, true
    );
  end if;
  return new;
end;
$$;

create or replace function public.portal_notify_change_order_updated()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'pending_approval'
    and (old.status is distinct from new.status or old.proposed_at is distinct from new.proposed_at) then
    perform public.portal_resolve_notifications(
      new.project_id, 'admin', new.id, array['change_requested']
    );
    perform public.portal_resolve_notifications(
      new.project_id, 'client', new.id, array['change_proposed']
    );
    perform public.portal_emit_notification(
      new.project_id, 'client', 'change_proposed', new.id, new.title, true
    );
  elsif old.status = 'pending_approval' and new.status in ('approved', 'rejected') then
    perform public.portal_resolve_notifications(
      new.project_id, 'client', new.id, array['change_proposed']
    );
    perform public.portal_emit_notification(
      new.project_id, 'admin', 'change_decided', new.id, new.title
    );
  end if;
  return new;
end;
$$;

drop trigger if exists project_updates_notify_insert on public.project_updates;
create trigger project_updates_notify_insert
  after insert on public.project_updates
  for each row execute function public.portal_notify_project_update();

drop trigger if exists project_updates_notify_edit on public.project_updates;
create trigger project_updates_notify_edit
  after update on public.project_updates
  for each row execute function public.portal_notify_project_update_edited();

drop trigger if exists client_feedback_notify_insert on public.client_feedback;
create trigger client_feedback_notify_insert
  after insert on public.client_feedback
  for each row execute function public.portal_notify_feedback_created();

drop trigger if exists client_feedback_notify_reply on public.client_feedback;
create trigger client_feedback_notify_reply
  after update of reply, replied_at on public.client_feedback
  for each row execute function public.portal_notify_feedback_replied();

drop trigger if exists project_billing_notify_insert on public.project_billing_items;
create trigger project_billing_notify_insert
  after insert on public.project_billing_items
  for each row execute function public.portal_notify_billing_created();

drop trigger if exists project_billing_notify_status on public.project_billing_items;
create trigger project_billing_notify_status
  after update of status on public.project_billing_items
  for each row execute function public.portal_notify_billing_status();

drop trigger if exists project_change_orders_notify_insert on public.project_change_orders;
create trigger project_change_orders_notify_insert
  after insert on public.project_change_orders
  for each row execute function public.portal_notify_change_order_created();

drop trigger if exists project_change_orders_notify_update on public.project_change_orders;
create trigger project_change_orders_notify_update
  after update of status, proposed_at on public.project_change_orders
  for each row execute function public.portal_notify_change_order_updated();

insert into public.portal_notifications (
  project_id, audience, event_type, entity_id, summary, action_required, created_at
)
select feedback.project_id, 'admin', 'feedback_received', feedback.id, feedback.subject, true, feedback.created_at
  from public.client_feedback as feedback
  where feedback.reply is null
    and not exists (
      select 1 from public.portal_notifications as notification
      where notification.audience = 'admin'
        and notification.event_type = 'feedback_received'
        and notification.entity_id = feedback.id
        and notification.resolved_at is null
    );

insert into public.portal_notifications (
  project_id, audience, event_type, entity_id, summary, action_required, created_at
)
select billing.project_id, 'admin', 'payment_review', billing.id, billing.title, true, coalesce(billing.payment_proof_submitted_at, billing.created_at)
  from public.project_billing_items as billing
  where billing.status = 'pending_review'
    and not exists (
      select 1 from public.portal_notifications as notification
      where notification.audience = 'admin'
        and notification.event_type = 'payment_review'
        and notification.entity_id = billing.id
        and notification.resolved_at is null
    );

insert into public.portal_notifications (
  project_id, audience, event_type, entity_id, summary, action_required, created_at
)
select billing.project_id,
       'client',
       case when billing.status = 'rejected' then 'payment_rejected' else 'billing_created' end,
       billing.id,
       billing.title,
       true,
       billing.created_at
  from public.project_billing_items as billing
  where billing.status in ('unpaid', 'rejected')
    and not exists (
      select 1 from public.portal_notifications as notification
      where notification.audience = 'client'
        and notification.event_type = case when billing.status = 'rejected' then 'payment_rejected' else 'billing_created' end
        and notification.entity_id = billing.id
        and notification.resolved_at is null
    );

insert into public.portal_notifications (
  project_id, audience, event_type, entity_id, summary, action_required, created_at
)
select change_order.project_id, 'admin', 'change_requested', change_order.id, change_order.title, true, change_order.created_at
  from public.project_change_orders as change_order
  where change_order.status = 'requested'
    and not exists (
      select 1 from public.portal_notifications as notification
      where notification.audience = 'admin'
        and notification.event_type = 'change_requested'
        and notification.entity_id = change_order.id
        and notification.resolved_at is null
    );

insert into public.portal_notifications (
  project_id, audience, event_type, entity_id, summary, action_required, created_at
)
select change_order.project_id, 'client', 'change_proposed', change_order.id, change_order.title, true, coalesce(change_order.proposed_at, change_order.created_at)
  from public.project_change_orders as change_order
  where change_order.status = 'pending_approval'
    and not exists (
      select 1 from public.portal_notifications as notification
      where notification.audience = 'client'
        and notification.event_type = 'change_proposed'
        and notification.entity_id = change_order.id
        and notification.resolved_at is null
    );

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
alter table public.project_billing_items enable row level security;
alter table public.portal_payment_accounts enable row level security;
alter table public.project_change_orders enable row level security;
alter table public.portal_notifications enable row level security;
alter table public.portal_client_sessions enable row level security;
alter table public.portal_project_documents enable row level security;
alter table public.portal_invoices enable row level security;

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
      coalesce(jsonb_agg(project_files.path), '[]'::jsonb)
    from (
      select attachment.value ->> 'path' as path
      from public.project_updates as project_update
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(project_update.attachments) = 'array' then project_update.attachments
          else '[]'::jsonb
        end
      ) as attachment(value)
      where project_update.project_id = p_project_id
      union all
      select document.path
      from public.portal_project_documents as document
      where document.project_id = p_project_id
    ) as project_files;

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

create or replace function public.portal_approve_billing_item(
  p_item_id uuid
)
returns table (
  billing_item jsonb,
  invoice jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_billing_item public.project_billing_items%rowtype;
  v_project public.client_projects%rowtype;
  v_invoice public.portal_invoices%rowtype;
  v_paid_at timestamptz;
begin
  select *
    into v_billing_item
    from public.project_billing_items
    where id = p_item_id
    for update;

  if not found then
    raise exception 'Billing item not found';
  end if;

  if v_billing_item.status = 'paid' then
    select *
      into v_invoice
      from public.portal_invoices
      where billing_item_id = p_item_id;

    if found then
      return query select to_jsonb(v_billing_item), to_jsonb(v_invoice);
      return;
    end if;
    v_paid_at := coalesce(v_billing_item.paid_at, now());
  elsif v_billing_item.status = 'pending_review' then
    v_paid_at := now();
    update public.project_billing_items
      set status = 'paid',
          paid_at = v_paid_at,
          payment_review_note = null
      where id = p_item_id
      returning * into v_billing_item;
  else
    raise exception 'Payment proof is no longer awaiting review';
  end if;

  select *
    into v_project
    from public.client_projects
    where id = v_billing_item.project_id;

  if not found then
    raise exception 'Project not found';
  end if;

  insert into public.portal_invoices (
    invoice_number,
    billing_item_id,
    project_id,
    issued_at,
    paid_at,
    issuer_name,
    issuer_address,
    issuer_email,
    client_name,
    client_email,
    client_phone,
    project_name,
    project_code,
    project_location,
    description,
    amount,
    payment_bank_code
  )
  values (
    'INV-' || to_char(v_paid_at, 'YYYY') || '-' || lpad(nextval('public.portal_invoice_number_seq')::text, 6, '0'),
    v_billing_item.id,
    v_project.id,
    v_paid_at,
    v_paid_at,
    'PT. LINIER NUSA KARYA PERSADA',
    'Perumahan Kendari Indah, Blok F/7, Kendari City, Southeast Sulawesi, Indonesia',
    'hello@linierstudio.com',
    v_project.client_name,
    v_project.client_email,
    v_project.client_phone,
    v_project.project_name,
    v_project.project_code,
    v_project.location,
    v_billing_item.title,
    v_billing_item.amount,
    v_billing_item.selected_bank_code
  )
  returning * into v_invoice;

  return query select to_jsonb(v_billing_item), to_jsonb(v_invoice);
end;
$$;

revoke all on function public.portal_allow_login_attempt(uuid, boolean) from public, anon, authenticated;
revoke all on function public.portal_create_project_update(uuid, text, text, integer, date, jsonb) from public, anon, authenticated;
revoke all on function public.portal_update_project_update(uuid, text, text, integer, date, jsonb) from public, anon, authenticated;
revoke all on function public.portal_delete_project_update(uuid) from public, anon, authenticated;
revoke all on function public.portal_resolve_password_reset(uuid, text, text) from public, anon, authenticated;
revoke all on function public.portal_change_client_password(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.portal_approve_billing_item(uuid) from public, anon, authenticated;
grant execute on function public.portal_allow_login_attempt(uuid, boolean) to service_role;
grant execute on function public.portal_create_project_update(uuid, text, text, integer, date, jsonb) to service_role;
grant execute on function public.portal_update_project_update(uuid, text, text, integer, date, jsonb) to service_role;
grant execute on function public.portal_delete_project_update(uuid) to service_role;
grant execute on function public.portal_delete_project(uuid) to service_role;
grant execute on function public.portal_resolve_password_reset(uuid, text, text) to service_role;
grant execute on function public.portal_change_client_password(uuid, text, text, text, text) to service_role;
grant execute on function public.portal_approve_billing_item(uuid) to service_role;

revoke all on public.client_projects, public.project_updates, public.project_login_attempts, public.project_password_reset_requests, public.client_feedback, public.project_billing_items, public.portal_payment_settings, public.portal_payment_accounts, public.project_change_orders, public.portal_notifications, public.portal_client_sessions, public.portal_project_documents, public.portal_invoices from anon, authenticated;
grant select, insert on public.client_projects to service_role;
grant select, insert, update, delete on public.project_updates to service_role;
grant select, insert, update, delete on public.project_login_attempts to service_role;
grant select, insert, update on public.project_password_reset_requests to service_role;
grant select, insert, update on public.client_feedback to service_role;
grant select, insert, update, delete on public.project_billing_items to service_role;
grant select, insert, update on public.portal_payment_settings to service_role;
grant select, insert, update on public.portal_payment_accounts to service_role;
grant select, insert, update, delete on public.project_change_orders to service_role;
grant select, insert, update, delete on public.portal_notifications to service_role;
grant select, insert, update, delete on public.portal_client_sessions to service_role;
grant select, insert, update, delete on public.portal_project_documents to service_role;
grant select, insert, update, delete on public.portal_invoices to service_role;
grant usage, select on sequence public.portal_invoice_number_seq to service_role;
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
