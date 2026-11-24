-- =============================================================================
-- IMAFORBES — CONSOLIDATED SUPABASE SCHEMA, RPCs & HARDENED RLS POLICIES
-- Ejecuta este script en el SQL Editor del Dashboard de Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. NORMALIZACIÓN DE DATOS (work_experiences)
-- -----------------------------------------------------------------------------
UPDATE public.work_experiences
SET
  title = 'Software Engineer',
  description = 'As a Software Engineer focused on modernizing the notary''s operations by developing a custom financial and operational management system. Key contributions included gathering requirements from staff, mapping out core legal processes (such as real estate transactions and wills), and designing the system''s architecture to include modules for CRM, document automation, and financial control.',
  updated_at = NOW()
WHERE id = 1;

-- -----------------------------------------------------------------------------
-- 2. FUNCIONES RPC SEGURAS (SECURITY DEFINER) PARA VISTAS Y LIKES DEL BLOG
--    Permiten incrementar contadores sin otorgar permiso UPDATE sobre blog_posts
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_blog_view(target_post_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_views INTEGER;
BEGIN
  UPDATE public.blog_posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = target_post_id AND status = 'published'
  RETURNING views_count INTO new_views;

  RETURN new_views;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_blog_like(target_post_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE public.blog_posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = target_post_id AND status = 'published'
  RETURNING likes_count INTO new_likes;

  RETURN new_likes;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_blog_like(target_post_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_likes INTEGER;
BEGIN
  UPDATE public.blog_posts
  SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1)
  WHERE id = target_post_id AND status = 'published'
  RETURNING likes_count INTO new_likes;

  RETURN new_likes;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_blog_view(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_like(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_blog_like(INTEGER) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. RLS EN blog_posts (Oculta borradores a visitantes anónimos)
-- -----------------------------------------------------------------------------
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Lectura pública de posts publicados" ON public.blog_posts;
DROP POLICY IF EXISTS "Public read access" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public read" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public update" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can update likes and views" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin full access on blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin control total de blog_posts" ON public.blog_posts;

CREATE POLICY "Lectura pública de posts publicados"
  ON public.blog_posts FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Admin control total de blog_posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.blog_posts FROM anon;
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 4. RLS EN blog_views y blog_likes (Protege privacidad de IPs y User-Agents)
--    Visitantes anónimos solo pueden INSERTAR eventos, nunca LEER IPs ajenas
-- -----------------------------------------------------------------------------
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.blog_views;
DROP POLICY IF EXISTS "Allow public read" ON public.blog_views;
DROP POLICY IF EXISTS "Allow public insert" ON public.blog_views;
DROP POLICY IF EXISTS "Anon insert blog_views" ON public.blog_views;
DROP POLICY IF EXISTS "Admin full access blog_views" ON public.blog_views;

CREATE POLICY "Anon insert blog_views"
  ON public.blog_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin full access blog_views"
  ON public.blog_views FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

REVOKE SELECT, UPDATE, DELETE ON public.blog_views FROM anon;
GRANT INSERT ON public.blog_views TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_views TO authenticated, service_role;

DROP POLICY IF EXISTS "Public read access" ON public.blog_likes;
DROP POLICY IF EXISTS "Allow public read" ON public.blog_likes;
DROP POLICY IF EXISTS "Allow public insert" ON public.blog_likes;
DROP POLICY IF EXISTS "Anon insert blog_likes" ON public.blog_likes;
DROP POLICY IF EXISTS "Admin full access blog_likes" ON public.blog_likes;

CREATE POLICY "Anon insert blog_likes"
  ON public.blog_likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin full access blog_likes"
  ON public.blog_likes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

REVOKE SELECT, UPDATE, DELETE ON public.blog_likes FROM anon;
GRANT INSERT ON public.blog_likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_likes TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 5. RLS EN blog_comments (Comentarios moderados del blog)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name VARCHAR(80) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON public.blog_comments(created_at DESC);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de comentarios aprobados" ON public.blog_comments;
DROP POLICY IF EXISTS "Visitantes pueden publicar comentarios" ON public.blog_comments;
DROP POLICY IF EXISTS "Admin control total de comentarios" ON public.blog_comments;

CREATE POLICY "Lectura pública de comentarios aprobados"
  ON public.blog_comments FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Visitantes pueden publicar comentarios"
  ON public.blog_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'approved'
    AND char_length(trim(author_name)) >= 2
    AND char_length(trim(content)) >= 2
  );

CREATE POLICY "Admin control total de comentarios"
  ON public.blog_comments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

REVOKE UPDATE, DELETE ON public.blog_comments FROM anon;
GRANT SELECT, INSERT ON public.blog_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_comments TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6. RLS EN datos (Bandeja de mensajes de contacto)
--    Visitantes solo pueden enviar mensajes (INSERT); solo Admin puede leer/borrar
-- -----------------------------------------------------------------------------
ALTER TABLE public.datos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert contact message" ON public.datos;
DROP POLICY IF EXISTS "Public can insert messages" ON public.datos;
DROP POLICY IF EXISTS "Admin full access datos" ON public.datos;

CREATE POLICY "Anon insert contact message"
  ON public.datos FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(nombre)) >= 2
    AND char_length(trim(email)) >= 5
    AND char_length(trim(mensaje)) >= 10
  );

CREATE POLICY "Admin full access datos"
  ON public.datos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

REVOKE SELECT, UPDATE, DELETE ON public.datos FROM anon;
GRANT INSERT ON public.datos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.datos TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 7. RLS EN work_experiences y portfolio_settings
-- -----------------------------------------------------------------------------
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published experiences" ON public.work_experiences;
DROP POLICY IF EXISTS "Admin full access work_experiences" ON public.work_experiences;

CREATE POLICY "Public read published experiences"
  ON public.work_experiences FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Admin full access work_experiences"
  ON public.work_experiences FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.work_experiences FROM anon;
GRANT SELECT ON public.work_experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_experiences TO authenticated, service_role;

ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read portfolio_settings" ON public.portfolio_settings;
DROP POLICY IF EXISTS "Admin full access portfolio_settings" ON public.portfolio_settings;

CREATE POLICY "Public read portfolio_settings"
  ON public.portfolio_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin full access portfolio_settings"
  ON public.portfolio_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.portfolio_settings FROM anon;
GRANT SELECT ON public.portfolio_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_settings TO authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
