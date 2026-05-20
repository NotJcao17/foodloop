-- Solo reemplaza el trigger handle_new_user con la versión robusta
-- Supabase → SQL Editor → Run

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_name      text;
  v_user_type user_type;
begin
  v_name := coalesce(
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  begin
    v_user_type := (new.raw_user_meta_data->>'user_type')::user_type;
  exception when others then
    v_user_type := 'student';
  end;

  insert into profiles (id, name, user_type)
  values (new.id, v_name, v_user_type)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

select 'Trigger actualizado ✅' as resultado;
