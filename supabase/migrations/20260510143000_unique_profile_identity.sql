create unique index if not exists profiles_unique_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

create unique index if not exists profiles_unique_name_lower_idx
  on public.profiles (lower(name))
  where name is not null;
