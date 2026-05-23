
DO $$
DECLARE
  admin_uid UUID;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@certificapy.com';
  IF admin_uid IS NULL THEN
    admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud
    ) VALUES (
      admin_uid, '00000000-0000-0000-0000-000000000000',
      'admin@certificapy.com', crypt('admin123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrador CertificaPy"}',
      false, 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (user_id, full_name)
  SELECT admin_uid, 'Administrador CertificaPy'
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = admin_uid);

  INSERT INTO public.user_roles (user_id, role)
  SELECT admin_uid, 'admin'::app_role
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = admin_uid AND role = 'admin');
END $$;

DO $$
DECLARE
  client_uid UUID;
BEGIN
  SELECT id INTO client_uid FROM auth.users WHERE email = 'cliente@certificapy.com';
  IF client_uid IS NULL THEN
    client_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud
    ) VALUES (
      client_uid, '00000000-0000-0000-0000-000000000000',
      'cliente@certificapy.com', crypt('test123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Cliente de Prueba"}',
      false, 'authenticated', 'authenticated'
    );
  END IF;

  INSERT INTO public.profiles (user_id, full_name)
  SELECT client_uid, 'Cliente de Prueba'
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = client_uid);

  INSERT INTO public.user_roles (user_id, role)
  SELECT client_uid, 'user'::app_role
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = client_uid AND role = 'user');
END $$;
