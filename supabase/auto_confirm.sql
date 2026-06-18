-- ============================================
-- Función para auto-confirmar usuarios
-- Se ejecuta con permisos de administrador
-- (SECURITY DEFINER) pero la llama el cliente
-- con la anon key (vía RPC).
-- ============================================

CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = auth.uid() AND email_confirmed_at IS NULL;
  RETURN FOUND;
END;
$$;

-- Permitir que usuarios autenticados la ejecuten
GRANT EXECUTE ON FUNCTION auto_confirm_user TO authenticated;
