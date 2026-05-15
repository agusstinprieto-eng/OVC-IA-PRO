-- =============================================================
--  OCV TORREÓN — Esquema Relacional v1.0
--  Módulos: Cartelera de Eventos + Boletera
--  Convenciones: snake_case, UUID v4, timestamps con TZ,
--                RLS habilitado en todas las tablas públicas.
-- =============================================================

-- ── Extensiones ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- búsqueda full-text en eventos


-- ═══════════════════════════════════════════════════════════════
--  MÓDULO 1 — USUARIOS / PERFILES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'visitor'
                  CHECK (role IN ('visitor','organizer','scanner','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════
--  MÓDULO 2 — CARTELERA DE EVENTOS
-- ═══════════════════════════════════════════════════════════════

-- ── Recintos ──────────────────────────────────────────────────
CREATE TABLE public.venues (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  address       TEXT,
  city          TEXT NOT NULL DEFAULT 'Torreón',
  state         TEXT NOT NULL DEFAULT 'Coahuila',
  capacity      INT,
  lat           NUMERIC(9,6),
  lng           NUMERIC(9,6),
  image_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Categorías de eventos ──────────────────────────────────────
CREATE TABLE public.event_categories (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  color         TEXT DEFAULT '#00aad1',   -- color hex para badge UI
  icon          TEXT                       -- nombre de icono (Lucide, etc.)
);

-- Seed de categorías base
INSERT INTO public.event_categories (name, slug, color, icon) VALUES
  ('Conciertos',       'conciertos',    '#ff2014', 'music'),
  ('Convenciones',     'convenciones',  '#00aad1', 'building-2'),
  ('Deportes',         'deportes',      '#3da92b', 'trophy'),
  ('Gastronomía',      'gastronomia',   '#ffdc00', 'utensils'),
  ('Arte y Cultura',   'arte-cultura',  '#ff0294', 'palette'),
  ('Negocios',         'negocios',      '#00bce5', 'briefcase'),
  ('Familiar',         'familiar',      '#3da92b', 'users'),
  ('Otro',             'otro',          '#a1b0b6', 'tag');

-- ── Eventos ────────────────────────────────────────────────────
CREATE TABLE public.events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  category_id     INT REFERENCES public.event_categories(id) ON DELETE SET NULL,
  venue_id        UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  organizer_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Fechas
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  doors_open_at   TIMESTAMPTZ,

  -- Media
  cover_image_url TEXT,
  banner_url      TEXT,

  -- Estado del evento
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','published','sold_out','cancelled','finished')),
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_free         BOOLEAN NOT NULL DEFAULT FALSE,

  -- SEO / redes
  meta_description TEXT,
  tags             TEXT[],

  -- Configuración de venta
  sale_starts_at  TIMESTAMPTZ,
  sale_ends_at    TIMESTAMPTZ,
  max_tickets_per_order INT DEFAULT 10,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsqueda y filtrado
CREATE INDEX idx_events_status      ON public.events (status);
CREATE INDEX idx_events_starts_at   ON public.events (starts_at);
CREATE INDEX idx_events_category    ON public.events (category_id);
CREATE INDEX idx_events_featured    ON public.events (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_events_title_trgm  ON public.events USING GIN (title gin_trgm_ops);

-- ── Imágenes adicionales del evento ───────────────────────────
CREATE TABLE public.event_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  caption    TEXT,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Patrocinadores del evento (relación M:M) ───────────────────
CREATE TABLE public.sponsors (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  logo_url   TEXT,
  website    TEXT
);

CREATE TABLE public.event_sponsors (
  event_id   UUID REFERENCES public.events(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE CASCADE,
  tier       TEXT DEFAULT 'standard' CHECK (tier IN ('platinum','gold','silver','standard')),
  PRIMARY KEY (event_id, sponsor_id)
);


-- ═══════════════════════════════════════════════════════════════
--  MÓDULO 3 — BOLETERA
-- ═══════════════════════════════════════════════════════════════

-- ── Tipos de boleto por evento ─────────────────────────────────
CREATE TABLE public.ticket_types (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,                 -- "VIP", "General", "Palco"
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency        CHAR(3) NOT NULL DEFAULT 'MXN',
  quantity_total  INT NOT NULL,
  quantity_sold   INT NOT NULL DEFAULT 0,        -- actualizado por trigger
  quantity_reserved INT NOT NULL DEFAULT 0,     -- boletos en carrito activo
  max_per_order   INT DEFAULT 10,
  sale_starts_at  TIMESTAMPTZ,
  sale_ends_at    TIMESTAMPTZ,
  is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      SMALLINT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_qty CHECK (quantity_sold + quantity_reserved <= quantity_total)
);

CREATE INDEX idx_ticket_types_event ON public.ticket_types (event_id);

-- ── Órdenes de compra ─────────────────────────────────────────
CREATE TABLE public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT NOT NULL UNIQUE,           -- ej. OCV-2024-000001
  buyer_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Contacto (por si compra como invitado)
  buyer_email     TEXT NOT NULL,
  buyer_name      TEXT NOT NULL,
  buyer_phone     TEXT,

  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','reserved','paid','cancelled','refunded','expired')),

  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  fees            NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency        CHAR(3) NOT NULL DEFAULT 'MXN',

  -- Expiración de reserva (para evitar stock muerto)
  reserved_until  TIMESTAMPTZ,

  -- Metadatos de pago
  payment_method  TEXT,                           -- 'stripe' | 'mercadopago' | 'cash'
  payment_ref     TEXT,                           -- ID externo del proveedor

  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer     ON public.orders (buyer_id);
CREATE INDEX idx_orders_status    ON public.orders (status);
CREATE INDEX idx_orders_number    ON public.orders (order_number);

-- Secuencia para order_number legible
CREATE SEQUENCE public.order_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.order_number := 'OCV-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                      LPAD(NEXTVAL('public.order_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.generate_order_number();

-- ── Líneas de la orden ────────────────────────────────────────
CREATE TABLE public.order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_type_id  UUID NOT NULL REFERENCES public.ticket_types(id),
  quantity        INT NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(10,2) NOT NULL,
  subtotal        NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items (order_id);

-- ── Boletos individuales (uno por asistente) ──────────────────
CREATE TABLE public.tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_type_id  UUID NOT NULL REFERENCES public.ticket_types(id),
  event_id        UUID NOT NULL REFERENCES public.events(id),

  -- Datos del portador
  holder_name     TEXT,
  holder_email    TEXT,

  -- QR
  qr_code         TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  qr_url          TEXT,                           -- URL escaneada en puerta

  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','used','cancelled','transferred')),

  -- Folio visible en el boleto impreso
  folio           TEXT NOT NULL UNIQUE,

  checked_in_at   TIMESTAMPTZ,
  checked_in_by   UUID REFERENCES public.profiles(id),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_order    ON public.tickets (order_id);
CREATE INDEX idx_tickets_event    ON public.tickets (event_id);
CREATE INDEX idx_tickets_qr       ON public.tickets (qr_code);
CREATE INDEX idx_tickets_status   ON public.tickets (status);

-- Secuencia para folio legible
CREATE SEQUENCE public.ticket_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_ticket_folio()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.folio := 'TOR-' || TO_CHAR(NOW(), 'YYMMDD') || '-' ||
               LPAD(NEXTVAL('public.ticket_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_ticket_folio
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE PROCEDURE public.generate_ticket_folio();

-- ── Registro de pagos ─────────────────────────────────────────
CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('stripe','mercadopago','cash','transfer')),
  provider_id     TEXT,                           -- charge_id / payment_intent / etc.
  amount          NUMERIC(10,2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'MXN',
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','succeeded','failed','refunded')),
  raw_payload     JSONB,                          -- webhook completo del proveedor
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order    ON public.payments (order_id);
CREATE INDEX idx_payments_provider ON public.payments (provider, provider_id);

-- ── Validaciones / Escaneos en puerta ────────────────────────
CREATE TABLE public.ticket_scans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID NOT NULL REFERENCES public.tickets(id),
  scanned_by  UUID REFERENCES public.profiles(id),
  result      TEXT NOT NULL CHECK (result IN ('ok','already_used','invalid','cancelled')),
  device_info TEXT,
  scanned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scans_ticket ON public.ticket_scans (ticket_id);


-- ═══════════════════════════════════════════════════════════════
--  TRIGGERS — Mantener quantity_sold actualizado
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.sync_ticket_quantity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Al confirmar una orden, incrementa quantity_sold
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE public.ticket_types tt
    SET quantity_sold = quantity_sold + oi.quantity,
        quantity_reserved = GREATEST(0, quantity_reserved - oi.quantity)
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND oi.ticket_type_id = tt.id;

  -- Al cancelar/expirar, libera la reserva
  ELSIF NEW.status IN ('cancelled','expired') AND OLD.status = 'reserved' THEN
    UPDATE public.ticket_types tt
    SET quantity_reserved = GREATEST(0, quantity_reserved - oi.quantity)
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND oi.ticket_type_id = tt.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_ticket_qty
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.sync_ticket_quantity();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_scans    ENABLE ROW LEVEL SECURITY;

-- ── Helpers de rol ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ── Policies: Profiles ────────────────────────────────────────
CREATE POLICY "profile_select_own"  ON public.profiles FOR SELECT  USING (id = auth.uid());
CREATE POLICY "profile_update_own"  ON public.profiles FOR UPDATE  USING (id = auth.uid());
CREATE POLICY "profile_admin_all"   ON public.profiles FOR ALL     USING (get_my_role() = 'admin');

-- ── Policies: Events (lectura pública de publicados) ──────────
CREATE POLICY "events_public_read"  ON public.events FOR SELECT
  USING (status = 'published' OR organizer_id = auth.uid() OR get_my_role() IN ('admin','organizer'));

CREATE POLICY "events_organizer_manage" ON public.events FOR ALL
  USING (organizer_id = auth.uid() OR get_my_role() = 'admin');

-- ── Policies: Venues / Categorías (lectura pública) ───────────
CREATE POLICY "venues_public_read"      ON public.venues           FOR SELECT USING (TRUE);
CREATE POLICY "categories_public_read"  ON public.event_categories FOR SELECT USING (TRUE);
CREATE POLICY "venues_admin_manage"     ON public.venues           FOR ALL    USING (get_my_role() = 'admin');

-- ── Policies: Ticket Types (lectura pública) ──────────────────
CREATE POLICY "tt_public_read"    ON public.ticket_types FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "tt_admin_manage"   ON public.ticket_types FOR ALL    USING (get_my_role() IN ('admin','organizer'));

-- ── Policies: Orders (sólo el dueño + admin) ─────────────────
CREATE POLICY "orders_owner_read" ON public.orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "orders_owner_ins"  ON public.orders FOR INSERT WITH CHECK (buyer_id = auth.uid() OR buyer_id IS NULL);
CREATE POLICY "orders_admin_all"  ON public.orders FOR ALL    USING (get_my_role() = 'admin');

-- ── Policies: Order Items ─────────────────────────────────────
CREATE POLICY "oi_owner_read" ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()));
CREATE POLICY "oi_admin_all"  ON public.order_items FOR ALL USING (get_my_role() = 'admin');

-- ── Policies: Tickets ─────────────────────────────────────────
CREATE POLICY "tickets_owner_read" ON public.tickets FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()));
CREATE POLICY "tickets_scanner_checkin" ON public.tickets FOR UPDATE
  USING (get_my_role() IN ('scanner','admin'))
  WITH CHECK (get_my_role() IN ('scanner','admin'));
CREATE POLICY "tickets_admin_all" ON public.tickets FOR ALL USING (get_my_role() = 'admin');

-- ── Policies: Payments (sólo admin + backend) ────────────────
CREATE POLICY "payments_admin_all" ON public.payments FOR ALL USING (get_my_role() = 'admin');

-- ── Policies: Ticket Scans ────────────────────────────────────
CREATE POLICY "scans_scanner_ins" ON public.ticket_scans FOR INSERT
  WITH CHECK (get_my_role() IN ('scanner','admin'));
CREATE POLICY "scans_admin_read"  ON public.ticket_scans FOR SELECT
  USING (get_my_role() IN ('admin','organizer'));


-- ═══════════════════════════════════════════════════════════════
--  VISTAS ÚTILES (sin RLS — uso interno/reporting)
-- ═══════════════════════════════════════════════════════════════

CREATE VIEW public.v_event_summary AS
SELECT
  e.id,
  e.slug,
  e.title,
  e.status,
  e.starts_at,
  e.is_featured,
  v.name         AS venue_name,
  ec.name        AS category_name,
  ec.color       AS category_color,
  COALESCE(SUM(tt.quantity_total), 0)  AS total_capacity,
  COALESCE(SUM(tt.quantity_sold),  0)  AS tickets_sold,
  COALESCE(SUM(tt.quantity_sold * tt.price), 0) AS revenue_mxn
FROM public.events e
LEFT JOIN public.venues          v   ON v.id  = e.venue_id
LEFT JOIN public.event_categories ec ON ec.id = e.category_id
LEFT JOIN public.ticket_types    tt  ON tt.event_id = e.id
GROUP BY e.id, v.name, ec.name, ec.color;
