-- ============================================================================
-- V-DESK — initial PostgreSQL schema (ADR-010)
--
-- One table per former MongoDB collection, same names, same field names once a
-- repository aliases them back (`created_at AS "createdAt"`), so services,
-- mappers and the API contract are unchanged.
--
-- House rules this schema keeps (docs/backend/rules.md):
--   §13  money is integer paise — `bigint`, never float
--   §15  `ref` is the public identifier; the surrogate `id` never leaves the API
--   §16  `deleted_at` is the soft delete; every read filters on it
--   §17  every index is declared here, next to the query that needs it
--
-- Decisions worth knowing:
--   * CHECK lists instead of Postgres enum types: the allowed values live in the
--     module's constants.js, and a CHECK is cheap to change with the code. The
--     schema test (test/schema.test.js) fails if the two ever drift.
--   * jsonb for what was genuinely a sub-document (a frozen price breakdown, a
--     status history, an attribution touch) and plain columns for everything a
--     query filters, sorts or joins on.
--   * No TTL indexes — Postgres has none. The rows MongoDB used to expire are
--     deleted by the worker's purge job (src/shared/jobs/purge.js), which is
--     both visible and testable. Nothing depends on it for correctness: an
--     expired hold, token or code is already refused on read.
--   * `updated_at` is maintained by one trigger per table, so no UPDATE can
--     forget it (mongoose's `timestamps: true` did the same).
-- ============================================================================

-- ── Shared plumbing ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- A calendar date the API treats as text ('2026-10-27', always IST). `to_date` rolls invalid dates over
-- ('2026-13-45' becomes 2027-02-14), so comparing the result back to the input rejects a date that never
-- existed — the same rule the request schemas apply (booking.time.js `isCalendarDate`).
CREATE DOMAIN ist_date AS text CHECK (
  VALUE ~ '^\d{4}-\d{2}-\d{2}$' AND to_char(to_date(VALUE, 'YYYY-MM-DD'), 'YYYY-MM-DD') = VALUE
);

-- ============================================================================
-- Identity — staff users and sessions
-- ============================================================================

CREATE TABLE users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref                text        NOT NULL UNIQUE,
  -- Stored lower-case by identity.validation.js. Unique outright, as it was in
  -- MongoDB: a soft-deleted account keeps its address reserved.
  email              text        NOT NULL UNIQUE,
  name               text        NOT NULL,
  role               text        NOT NULL CHECK (role IN
                       ('SUPER_ADMIN','OPS_ADMIN','SALES_MANAGER','SALES_EXEC','FINANCE','COMPLIANCE','CONTENT')),
  status             text        NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  -- argon2id (rules.md §19).
  password_hash      text        NOT NULL,
  -- The former `mfa` sub-document: flat columns because the service updates one
  -- field at a time and the repository rebuilds the nested shape on read.
  mfa_enabled        boolean     NOT NULL DEFAULT false,
  mfa_secret         text,
  mfa_pending_secret text,
  mfa_last_step      bigint      NOT NULL DEFAULT -1,
  failed_attempts    integer     NOT NULL DEFAULT 0,
  locked_until       timestamptz,
  last_login_at      timestamptz,
  created_by         text,
  deleted_at         timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX users_list_idx ON users (created_at DESC, ref DESC) WHERE deleted_at IS NULL;
-- "Is there another active super admin?" before a demotion.
CREATE INDEX users_role_status_idx ON users (role, status) WHERE deleted_at IS NULL;

CREATE TABLE refresh_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Only the SHA-256 of the token is ever stored.
  token_hash text        NOT NULL UNIQUE,
  -- A staff `users.ref` or a customer `customers.ref`: both surfaces rotate
  -- tokens the same way, and the subject is resolved by prefix on refresh.
  user_ref   text        NOT NULL,
  -- Every rotation of one login shares a family; reuse revokes the family.
  family     text        NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_ref, revoked_at);
CREATE INDEX refresh_tokens_family_idx ON refresh_tokens (family);
-- Purge job.
CREATE INDEX refresh_tokens_expires_idx ON refresh_tokens (expires_at);

-- ============================================================================
-- Identity — customers (phone OTP, ADR-009)
-- ============================================================================

CREATE TABLE customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref           text        NOT NULL UNIQUE,
  -- The account itself: 10 normalised digits, one account per number.
  mobile        text        NOT NULL UNIQUE,
  name          text        NOT NULL,
  email         text        NOT NULL DEFAULT '',
  company       text        NOT NULL DEFAULT '',
  status        text        NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX customers_list_idx ON customers (created_at DESC, ref DESC);

CREATE TABLE otp_challenges (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- One live challenge per number; a new request replaces the code on this row.
  mobile            text        NOT NULL UNIQUE,
  -- Peppered SHA-256. NULL once the code has been spent, so it cannot be reused.
  code_hash         text,
  expires_at        timestamptz NOT NULL,
  attempts          integer     NOT NULL DEFAULT 0,
  sends             integer     NOT NULL DEFAULT 1,
  window_started_at timestamptz NOT NULL,
  last_sent_at      timestamptz NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
-- Purge job: the row outlives its code so the send budget survives the window.
CREATE INDEX otp_challenges_last_sent_idx ON otp_challenges (last_sent_at);

-- ============================================================================
-- Catalog — cities, centres, workspaces
-- ============================================================================

CREATE TABLE cities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref        text        NOT NULL UNIQUE,
  slug       text        NOT NULL UNIQUE,
  name       text        NOT NULL,
  state      text        NOT NULL,
  tier       text        NOT NULL CHECK (tier IN ('Tier-1','Tier-2','Tier-3')),
  tagline    text        NOT NULL DEFAULT '',
  localities text[]      NOT NULL DEFAULT '{}',
  active     boolean     NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cities_active_idx ON cities (active) WHERE deleted_at IS NULL;

CREATE TABLE centres (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref              text        NOT NULL UNIQUE,
  city_ref         text        NOT NULL,
  -- Denormalised city name, as it was in MongoDB: every centre list shows it.
  city             text        NOT NULL,
  area_name        text        NOT NULL,
  full_name        text        NOT NULL,
  address          text        NOT NULL,
  services         text[]      NOT NULL DEFAULT '{}',
  -- Virtual Office per month / coworking per day, integer paise (rules.md §13).
  vo_price_paise   bigint,
  cw_price_paise   bigint,
  meeting_capacity text        NOT NULL DEFAULT '',
  status           text        NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available','limited','unavailable')),
  flagship         boolean     NOT NULL DEFAULT false,
  active           boolean     NOT NULL DEFAULT true,
  deleted_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX centres_city_status_idx ON centres (city_ref, status) WHERE deleted_at IS NULL;
CREATE INDEX centres_list_idx ON centres (created_at DESC, ref DESC) WHERE deleted_at IS NULL;
-- The booking flow resolves a centre by city + area.
CREATE INDEX centres_city_area_idx ON centres (city, area_name) WHERE deleted_at IS NULL;

CREATE TABLE workspaces (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref               text        NOT NULL UNIQUE,
  centre_ref        text        NOT NULL,
  city              text        NOT NULL,
  locality          text        NOT NULL,
  name              text        NOT NULL,
  type              text        NOT NULL CHECK (type IN
                      ('Virtual Office','Coworking','Meeting Rooms','Private Office')),
  capacity          integer     NOT NULL,
  price_month_paise bigint      NOT NULL,
  price_hour_paise  bigint      NOT NULL,
  amenities         text[]      NOT NULL DEFAULT '{}',
  status            text        NOT NULL DEFAULT 'available'
                      CHECK (status IN ('available','limited','unavailable')),
  rating            numeric(2,1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  reviews           integer     NOT NULL DEFAULT 0,
  active            boolean     NOT NULL DEFAULT true,
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX workspaces_city_type_idx ON workspaces (city, type, status) WHERE deleted_at IS NULL;
CREATE INDEX workspaces_city_capacity_idx ON workspaces (city, capacity) WHERE deleted_at IS NULL;
CREATE INDEX workspaces_city_price_idx ON workspaces (city, price_month_paise) WHERE deleted_at IS NULL;
CREATE INDEX workspaces_centre_idx ON workspaces (centre_ref) WHERE deleted_at IS NULL;
CREATE INDEX workspaces_list_idx ON workspaces (created_at DESC, ref DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- CRM — leads and their timeline
-- ============================================================================

CREATE TABLE leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref           text        NOT NULL UNIQUE,
  name          text        NOT NULL,
  mobile        text        NOT NULL DEFAULT '',
  email         text        NOT NULL DEFAULT '',
  city          text        NOT NULL DEFAULT '',
  service       text        NOT NULL DEFAULT '',
  company       text        NOT NULL DEFAULT '',
  -- What the visitor typed. Staff notes live in lead_activities.
  notes         text        NOT NULL DEFAULT '',
  source        text        NOT NULL DEFAULT '',
  status        text        NOT NULL DEFAULT 'NEW' CHECK (status IN
                  ('NEW','CONTACTED','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST')),
  score         integer     NOT NULL,
  assigned_to   text,
  -- { firstTouch, lastTouch }: read whole, never filtered on, so one jsonb.
  attribution   jsonb       NOT NULL DEFAULT '{"firstTouch": null, "lastTouch": null}',
  -- Last 10 digits of `mobile`, so one contact matches across formats.
  mobile_digits text,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_list_idx ON leads (created_at DESC, ref DESC) WHERE deleted_at IS NULL;
CREATE INDEX leads_status_idx ON leads (status, created_at DESC) WHERE deleted_at IS NULL;
-- Per-contact submission limits.
CREATE INDEX leads_mobile_idx ON leads (mobile_digits, created_at DESC) WHERE mobile_digits IS NOT NULL;
CREATE INDEX leads_email_idx ON leads (email, created_at DESC) WHERE email <> '';

-- An append-only timeline, so its key counts up: several activities written in one statement share a
-- timestamp, and `id` is then what keeps them in the order they happened.
CREATE TABLE lead_activities (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_ref    text        NOT NULL,
  type        text        NOT NULL CHECK (type IN ('created','status_changed','assigned','note')),
  -- `from` and `to` are SQL keywords; the repository aliases these back.
  from_status text,
  to_status   text,
  assigned_to text,
  note        text,
  actor       text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lead_activities_lead_idx ON lead_activities (lead_ref, created_at);

-- ============================================================================
-- Pricing — rule overrides and quotes
-- ============================================================================

CREATE TABLE pricing_rules (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text        NOT NULL UNIQUE CHECK (key IN
               ('tax','virtual_office','meeting_room','enterprise_desks','bundle')),
  -- Shape validated per key by pricing.validation.js.
  value      jsonb       NOT NULL,
  updated_by text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE quotes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref               text        NOT NULL UNIQUE,
  status            text        NOT NULL DEFAULT 'SENT' CHECK (status IN
                      ('DRAFT','SENT','VIEWED','ACCEPTED','REJECTED','EXPIRED')),
  product_type      text        NOT NULL CHECK (product_type IN
                      ('virtual_office','meeting_room','enterprise_desks','bundle')),
  product           text        NOT NULL,
  purpose           text        NOT NULL DEFAULT '',
  tenure            text        NOT NULL,
  rate_month_paise  bigint,
  name              text        NOT NULL,
  company           text        NOT NULL DEFAULT '',
  -- The validated request, and the breakdown frozen at creation.
  item              jsonb       NOT NULL,
  pricing           jsonb       NOT NULL,
  valid_until       timestamptz NOT NULL,
  history           jsonb       NOT NULL DEFAULT '[]',
  idempotency_key   text,
  request_hash      text,
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX quotes_idempotency_idx ON quotes (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX quotes_list_idx ON quotes (created_at DESC, ref DESC) WHERE deleted_at IS NULL;
CREATE INDEX quotes_status_idx ON quotes (status, created_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- Booking — meeting-room holds and the room-hours they reserve
-- ============================================================================

CREATE TABLE bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref             text        NOT NULL UNIQUE,
  status          text        NOT NULL DEFAULT 'HELD' CHECK (status IN
                    ('HELD','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED','EXPIRED')),
  centre_ref      text        NOT NULL,
  -- Centre display name, frozen at hold time.
  hub             text        NOT NULL,
  room            text        NOT NULL,
  room_capacity   text        NOT NULL DEFAULT '',
  "date"          ist_date    NOT NULL,
  start_hour      integer     NOT NULL,
  duration        integer     NOT NULL,
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  attendees       integer     NOT NULL,
  -- The signed-in customer who booked it (ADR-009).
  customer_ref    text        NOT NULL,
  -- Contact details copied from that account. PII: never logged, never public.
  customer        jsonb       NOT NULL,
  pricing         jsonb       NOT NULL,
  expires_at      timestamptz NOT NULL,
  history         jsonb       NOT NULL DEFAULT '[]',
  idempotency_key text,
  request_hash    text,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  -- Generated so the per-mobile hold cap can be indexed without a second copy
  -- of the number to keep in step.
  customer_mobile text GENERATED ALWAYS AS (customer->>'mobile') STORED
);
CREATE UNIQUE INDEX bookings_idempotency_idx ON bookings (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX bookings_list_idx ON bookings (created_at DESC, ref DESC) WHERE deleted_at IS NULL;
CREATE INDEX bookings_centre_date_idx ON bookings (centre_ref, "date") WHERE deleted_at IS NULL;
CREATE INDEX bookings_customer_idx ON bookings (customer_ref, created_at DESC, ref DESC) WHERE deleted_at IS NULL;
-- Unexpired holds for one mobile number.
CREATE INDEX bookings_mobile_holds_idx ON bookings (customer_mobile, status, expires_at);

-- One row per reserved room-hour: this unique index, not application code, is
-- what stops two bookings taking the same hour.
CREATE TABLE booking_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_ref  text        NOT NULL,
  room        text        NOT NULL,
  "date"      ist_date    NOT NULL,
  hour        integer     NOT NULL,
  booking_ref text        NOT NULL,
  -- The hold's expiry; NULL once the booking is confirmed (permanent).
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_slots_hour_unique UNIQUE (centre_ref, room, "date", hour)
);
CREATE INDEX booking_slots_booking_idx ON booking_slots (booking_ref);
-- Purge job (lapsed holds only — a confirmed slot has expires_at NULL).
CREATE INDEX booking_slots_expires_idx ON booking_slots (expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- Orders — what is owed for a quote or a booking
-- ============================================================================

CREATE TABLE orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref             text        NOT NULL UNIQUE,
  status          text        NOT NULL DEFAULT 'PENDING_PAYMENT'
                    CHECK (status IN ('PENDING_PAYMENT','PAID','CANCELLED','EXPIRED')),
  -- The former `source` sub-document: two columns, because one of them carries
  -- the uniqueness rule below.
  source_type     text        NOT NULL CHECK (source_type IN ('quote','booking')),
  source_ref      text        NOT NULL,
  description     text        NOT NULL,
  tenure          text        NOT NULL DEFAULT '',
  pricing         jsonb       NOT NULL,
  total_paise     bigint      NOT NULL,
  currency        text        NOT NULL DEFAULT 'INR',
  expires_at      timestamptz NOT NULL,
  history         jsonb       NOT NULL DEFAULT '[]',
  idempotency_key text,
  request_hash    text,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX orders_idempotency_idx ON orders (idempotency_key) WHERE idempotency_key IS NOT NULL;
-- At most one open order per quote / booking: the database settles concurrent attempts.
CREATE UNIQUE INDEX orders_open_source_idx ON orders (source_type, source_ref) WHERE status = 'PENDING_PAYMENT';
CREATE INDEX orders_list_idx ON orders (created_at DESC, ref DESC) WHERE deleted_at IS NULL;
CREATE INDEX orders_status_idx ON orders (status, created_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- Notifications — templates, and the log that doubles as the outgoing queue
-- ============================================================================

CREATE TABLE notification_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Never reused, even after a delete, so a notification's record of which
  -- template it came from stays true.
  key           text        NOT NULL UNIQUE,
  channel       text        NOT NULL CHECK (channel IN ('email','whatsapp','sms')),
  subject       text,
  body          text        NOT NULL,
  variables     text[]      NOT NULL DEFAULT '{}',
  transactional boolean     NOT NULL DEFAULT false,
  active        boolean     NOT NULL DEFAULT true,
  version       integer     NOT NULL DEFAULT 1,
  updated_by    text        NOT NULL,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- A queue, so its key counts up: messages that fall due at the same moment are sent in the order they
-- were accepted, which `id` is what records.
CREATE TABLE notification_log (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ref                 text        NOT NULL UNIQUE,
  -- "this message about this thing", chosen by the caller.
  dedupe_key          text        NOT NULL UNIQUE,
  request_hash        text        NOT NULL,
  template_key        text        NOT NULL,
  template_version    integer     NOT NULL,
  channel             text        NOT NULL CHECK (channel IN ('email','whatsapp','sms')),
  -- `to` is a SQL keyword; the repository aliases this back. PII: shown masked.
  recipient           text        NOT NULL,
  -- Rendered content, cleared once ACCEPTED or FAILED so it does not linger.
  subject             text,
  body                text,
  status              text        NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','SENDING','ACCEPTED','FAILED')),
  attempts            integer     NOT NULL DEFAULT 0,
  next_attempt_at     timestamptz NOT NULL,
  -- While SENDING: the claiming worker's lease and token.
  lease_until         timestamptz,
  claim_token         text,
  last_error          jsonb,
  provider_message_id text,
  accepted_at         timestamptz,
  failed_at           timestamptz,
  deleted_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notification_log_due_idx ON notification_log (status, channel, next_attempt_at, id);
CREATE INDEX notification_log_lease_idx ON notification_log (status, channel, lease_until);
CREATE INDEX notification_log_list_idx ON notification_log (created_at DESC, ref DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- CMS — one table for every content type, draft beside published
-- ============================================================================

CREATE TABLE content_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type              text        NOT NULL CHECK (type IN
                      ('faqs','testimonials','guides','legal','trust-claims','seo')),
  -- The entry's identifier within its type: a slug, or a page path for seo.
  key               text        NOT NULL,
  draft             jsonb       NOT NULL,
  published         jsonb,
  -- Draft version, +1 per save; staff send the version they loaded.
  version           integer     NOT NULL DEFAULT 1,
  published_version integer,
  -- `order` is a SQL keyword; the repository aliases this back.
  order_index       integer     NOT NULL DEFAULT 0,
  updated_by        text        NOT NULL,
  published_at      timestamptz,
  published_by      text,
  deleted_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
-- One live entry per (type, key); a deleted key can be created again.
CREATE UNIQUE INDEX content_entries_key_idx ON content_entries (type, key) WHERE deleted_at IS NULL;
CREATE INDEX content_entries_public_idx ON content_entries (type, order_index, key) WHERE deleted_at IS NULL;

-- Append-only: what was published, when and by whom.
CREATE TABLE content_revisions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text        NOT NULL CHECK (type IN
                 ('faqs','testimonials','guides','legal','trust-claims','seo')),
  key          text        NOT NULL,
  version      integer     NOT NULL,
  data         jsonb       NOT NULL,
  published_by text        NOT NULL,
  published_at timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_revisions_key_idx ON content_revisions (type, key, published_at DESC);

-- ============================================================================
-- Search — services, synonyms, redirects and settings
-- ============================================================================

CREATE TABLE search_services (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref                   text        NOT NULL UNIQUE,
  slug                  text        NOT NULL,
  name                  text        NOT NULL,
  icon                  text        NOT NULL DEFAULT '',
  eyebrow               text        NOT NULL DEFAULT '',
  title                 text        NOT NULL DEFAULT '',
  title_highlight       text        NOT NULL DEFAULT '',
  description           text        NOT NULL DEFAULT '',
  -- The client's `startingPrice` in rupees, stored as integer paise.
  starting_price_paise  bigint      NOT NULL,
  price_unit            text        NOT NULL DEFAULT '',
  -- Arrays of pairs/triples in the client's shape: read whole, so jsonb.
  stats                 jsonb       NOT NULL DEFAULT '[]',
  trust                 text[]      NOT NULL DEFAULT '{}',
  suitability           text[]      NOT NULL DEFAULT '{}',
  features              jsonb       NOT NULL DEFAULT '[]',
  process               jsonb       NOT NULL DEFAULT '[]',
  faqs                  jsonb       NOT NULL DEFAULT '[]',
  cta                   text        NOT NULL DEFAULT '',
  cta_to                text        NOT NULL DEFAULT '',
  deleted_at            timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX search_services_slug_idx ON search_services (slug) WHERE deleted_at IS NULL;

CREATE TABLE search_synonyms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref         text        NOT NULL UNIQUE,
  -- Normalised: lower-case, single spaces.
  term        text        NOT NULL,
  replacement text        NOT NULL,
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX search_synonyms_term_idx ON search_synonyms (term) WHERE deleted_at IS NULL;

CREATE TABLE search_redirects (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref        text        NOT NULL UNIQUE,
  -- Normalised, matched against the normalised visitor query.
  "query"    text        NOT NULL,
  target     text        NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX search_redirects_query_idx ON search_redirects ("query") WHERE deleted_at IS NULL;

CREATE TABLE search_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text        NOT NULL CHECK (key IN ('promotedCentres','popularSearches')),
  -- promotedCentres: centre refs · popularSearches: query strings.
  value      jsonb       NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX search_config_key_idx ON search_config (key) WHERE deleted_at IS NULL;

-- ============================================================================
-- Analytics — events, aged out by the purge job
-- ============================================================================

CREATE TABLE analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref         text        NOT NULL UNIQUE,
  -- The browser's own id, kept for matching with its local log. Not unique.
  client_ref  text,
  type        text        NOT NULL,
  -- Payload after PII stripping and size limits (analytics.privacy.js).
  data        jsonb       NOT NULL DEFAULT '{}',
  device      text        NOT NULL DEFAULT 'Unknown' CHECK (device IN ('Mobile','Desktop','Unknown')),
  -- When it happened on the device (clamped); created_at is when we received it.
  occurred_at timestamptz NOT NULL,
  -- Hash of the content: a retried batch inserts nothing new.
  dedupe_key  text        NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_list_idx ON analytics_events (created_at DESC, ref DESC);
CREATE INDEX analytics_events_type_idx ON analytics_events (type, created_at DESC);
CREATE INDEX analytics_events_window_idx ON analytics_events (occurred_at DESC, type);

-- ============================================================================
-- Domain events — the transactional outbox (ADR-005, ADR-008)
-- ============================================================================

-- Also a queue (see notification_log): events due at the same moment are delivered oldest first.
CREATE TABLE domain_events (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ref             text        NOT NULL UNIQUE,
  type            text        NOT NULL,
  version         integer     NOT NULL DEFAULT 1,
  occurred_at     timestamptz NOT NULL,
  -- The former `actor` and `entity` sub-documents.
  actor_type      text        NOT NULL,
  actor_id        text,
  entity_type     text        NOT NULL,
  entity_ref      text        NOT NULL,
  -- Small and free of personal data: handlers read details from the owner.
  payload         jsonb       NOT NULL DEFAULT '{}',
  status          text        NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','DONE','DEAD')),
  -- Handlers that have finished; a retry runs only the others.
  handled         text[]      NOT NULL DEFAULT '{}',
  attempts        integer     NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL,
  claim_token     text,
  lease_until     timestamptz,
  last_error      jsonb,
  completed_at    timestamptz,
  -- Set when DONE; the purge job removes delivered events after retention.
  expire_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
-- The dispatcher's claim query: due PENDING events, oldest first.
CREATE INDEX domain_events_due_idx ON domain_events (status, next_attempt_at, id);
-- "What happened to this lead / booking?"
CREATE INDEX domain_events_entity_idx ON domain_events (entity_ref, type);
-- Purge job.
CREATE INDEX domain_events_expire_idx ON domain_events (expire_at) WHERE expire_at IS NOT NULL;

-- ── updated_at triggers ────────────────────────────────────────────────────
-- Every table that has the column, so no UPDATE anywhere can forget it.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','refresh_tokens','customers','otp_challenges','cities','centres','workspaces',
    'leads','lead_activities','pricing_rules','quotes','bookings','booking_slots','orders',
    'notification_templates','notification_log','content_entries','search_services',
    'search_synonyms','search_redirects','search_config','domain_events'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t, t
    );
  END LOOP;
END $$;
