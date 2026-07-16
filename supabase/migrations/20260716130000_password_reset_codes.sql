create table if not exists password_reset_codes (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  code text not null,
  verified boolean default false,
  attempts int default 0,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

create index if not exists idx_password_reset_codes_email on password_reset_codes (email);
create index if not exists idx_password_reset_codes_code on password_reset_codes (code);

alter table password_reset_codes enable row level security;

create policy "Service role manages reset codes"
  on password_reset_codes for all
  using (true)
  with check (true);
