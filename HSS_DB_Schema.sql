-- =============================================================================
-- HSS UK MEMBERSHIP MANAGEMENT SYSTEM
-- Database Schema  |  PostgreSQL 14+
-- Version  : 1.0
-- Author   : Senior DB Architect
-- Date     : 2026-05-31
-- =============================================================================
--
-- ERD OVERVIEW (Top-level relationships)
--
--  GEOGRAPHY (Masters Hierarchy)
--  countries → regions → towns → activity_centres
--
--  RBAC
--  roles → role_permissions → module_actions ← modules
--
--  USERS & MEMBERS
--  admin_users ←→ roles
--  members → activity_centres
--  members → member_compliance (1:1)
--  members → member_dietary_requirements (1:N)
--  members → member_spoken_languages (1:N)
--  members → member_accounts (1:1 portal login)
--
--  EVENTS
--  events → activity_centres
--  events ← event_participants → members
--  events ← event_payments ← members
--  events ← event_media → members
--  events ← event_audience_filters
--
--  ANNOUNCEMENTS
--  announcements → activity_centres (optional scope)
--  announcements ← announcement_audience_filters
--  announcements ← notification_deliveries → members
--
--  ATTENDANCE
--  shakha_sessions → activity_centres
--  shakha_sessions ← session_attendance → members
--
--  FINANCE
--  donations → members, activity_centres
--  refunds → events, event_payments, members
--
--  LOGS & AUDIT
--  audit_logs, login_logs, api_logs, email_logs
--
--  SYSTEM
--  system_settings, static_pages, email_templates, in_app_notifications
--
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- SECTION 0 : ENUMS
-- =============================================================================

-- ── Record lifecycle ──────────────────────────────────────────
CREATE TYPE record_status         AS ENUM ('active', 'inactive');

-- ── Member ───────────────────────────────────────────────────
CREATE TYPE member_status         AS ENUM (
    'active', 'pending', 'pending_parental_consent', 'inactive', 'rejected'
);
CREATE TYPE member_type           AS ENUM ('adult', 'teen', 'child');
CREATE TYPE gender_type           AS ENUM ('male', 'female');
CREATE TYPE compliance_status     AS ENUM ('pending', 'completed');
CREATE TYPE consent_status        AS ENUM ('na', 'pending', 'granted');
CREATE TYPE age_group             AS ENUM ('bal', 'shishu', 'kishor', 'tarun', 'yuva', 'jyestha');
CREATE TYPE responsibility_type   AS ENUM ('Pramukh', 'Saha', 'Toli');
CREATE TYPE responsibility_level  AS ENUM ('national', 'region', 'town', 'centre');

-- ── Event ────────────────────────────────────────────────────
CREATE TYPE event_status          AS ENUM ('draft', 'published', 'active', 'cancelled', 'completed');
CREATE TYPE payment_type          AS ENUM ('paid', 'free');
CREATE TYPE rsvp_status           AS ENUM ('going', 'maybe', 'not_going');
CREATE TYPE chat_state            AS ENUM ('active', 'archived');
CREATE TYPE media_type            AS ENUM ('image', 'video');
CREATE TYPE payment_status        AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- ── Announcement ─────────────────────────────────────────────
CREATE TYPE announcement_status   AS ENUM ('draft', 'sent', 'scheduled');
CREATE TYPE announcement_scope    AS ENUM ('national', 'region', 'town', 'centre');
CREATE TYPE content_type          AS ENUM ('text', 'image', 'video');
CREATE TYPE priority_level        AS ENUM ('high', 'medium', 'low');
CREATE TYPE notification_schedule AS ENUM ('instant', 'scheduled');
CREATE TYPE notification_channel  AS ENUM ('push', 'email', 'bell');

-- ── Attendance ───────────────────────────────────────────────
CREATE TYPE session_frequency     AS ENUM ('weekly', 'fortnightly', 'monthly', 'one_off');
CREATE TYPE session_status        AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE attendance_status     AS ENUM ('present', 'absent', 'unmarked');
CREATE TYPE shakha_type           AS ENUM (
    'Swayamsevak Shakha', 'Sewa Shakha', 'Parivaar Shakha', 'Milan', 'Sampark Kendra'
);

-- ── Finance ──────────────────────────────────────────────────
CREATE TYPE donation_status       AS ENUM ('received', 'pledged', 'failed', 'refunded');
CREATE TYPE donation_channel      AS ENUM ('online', 'bank_transfer', 'cash', 'cheque');
CREATE TYPE donor_type            AS ENUM ('member', 'family', 'organisation', 'anonymous');
CREATE TYPE refund_status         AS ENUM ('requested', 'approved', 'processed', 'rejected');
CREATE TYPE refund_reason         AS ENUM (
    'event_cancelled', 'duplicate_payment', 'unable_to_attend', 'payment_error', 'other'
);

-- ── Logs ─────────────────────────────────────────────────────
CREATE TYPE audit_action_type     AS ENUM (
    'Create', 'Update', 'Delete', 'Status Change', 'Import', 'Export', 'Permission Update'
);
CREATE TYPE http_method           AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH');
CREATE TYPE login_status          AS ENUM ('Success', 'Failed');


-- =============================================================================
-- SECTION 1 : GEOGRAPHY — Masters Hierarchy
-- countries → regions → towns → activity_centres
-- =============================================================================

CREATE TABLE countries (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20)     UNIQUE NOT NULL,        -- 'HSS_UK', 'HSS_IE', …
    name            VARCHAR(100)    NOT NULL,               -- 'HSS UK'
    status          record_status   NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE countries IS 'Top-level geographic master — HSS country chapters';

CREATE TABLE regions (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id      UUID            NOT NULL REFERENCES countries(id),
    code            VARCHAR(30),
    name            VARCHAR(100)    NOT NULL,               -- 'London & South East'
    status          record_status   NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (country_id, name)
);
COMMENT ON TABLE regions IS 'Vibhaag (Region) — second level of geographic hierarchy';

CREATE TABLE towns (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id       UUID            NOT NULL REFERENCES regions(id),
    code            VARCHAR(30),
    name            VARCHAR(100)    NOT NULL,               -- 'Wembley', 'Birmingham', …
    status          record_status   NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (region_id, name)
);
COMMENT ON TABLE towns IS 'Nagar (Town) — third level of geographic hierarchy';

CREATE TABLE activity_centres (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    town_id         UUID            NOT NULL REFERENCES towns(id),
    code            VARCHAR(30),
    name            VARCHAR(150)    NOT NULL,               -- 'Wembley Activity Centre'
    address_line1   VARCHAR(200),
    address_line2   VARCHAR(200),
    postcode        VARCHAR(20),
    status          record_status   NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE activity_centres IS 'Shakha / Activity Centre — leaf node of geographic hierarchy';

CREATE TABLE role_types (
    -- HSS organisational job titles: Ghatnayak, Shikshak, Karyawaha, etc.
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100)    UNIQUE NOT NULL,        -- 'Ghatnayak', 'Shikshak', …
    code            VARCHAR(50),
    description     TEXT,
    status          record_status   NOT NULL DEFAULT 'active',
    sort_order      SMALLINT        DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE role_types IS 'HSS organisational role / job title master (Departments)';


-- =============================================================================
-- SECTION 2 : RBAC — Roles, Modules & Permissions
-- =============================================================================

CREATE TABLE roles (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100)    UNIQUE NOT NULL,        -- 'Super Admin', 'National Head', …
    code            VARCHAR(100)    UNIQUE NOT NULL,        -- 'super_admin', 'national_head', …
    description     TEXT,
    status          record_status   NOT NULL DEFAULT 'active',
    user_count      INT             DEFAULT 0,              -- cached; update via trigger
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE roles IS 'RBAC role personas — Super Admin, National Head, Town Head, etc.';

CREATE TABLE modules (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100)    NOT NULL,               -- 'Members Management'
    code            VARCHAR(50)     UNIQUE NOT NULL,        -- 'members', 'events', 'attendance', …
    display_order   SMALLINT        DEFAULT 0,
    status          record_status   NOT NULL DEFAULT 'active'
);
COMMENT ON TABLE modules IS 'System modules visible in the sidebar navigation';

CREATE TABLE module_actions (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id       UUID            NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    name            VARCHAR(150)    NOT NULL,               -- 'View / List', 'Add Member', …
    code            VARCHAR(100)    NOT NULL,               -- 'members_view', 'members_add', …
    UNIQUE (module_id, code)
);
COMMENT ON TABLE module_actions IS 'Granular actions per module (view, add, edit, delete, approve, export, …)';

CREATE TABLE role_permissions (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id         UUID            NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module_action_id UUID           NOT NULL REFERENCES module_actions(id) ON DELETE CASCADE,
    granted         BOOLEAN         NOT NULL DEFAULT TRUE,
    granted_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    granted_by      UUID,                                   -- FK to admin_users added later
    UNIQUE (role_id, module_action_id)
);
COMMENT ON TABLE role_permissions IS 'Many-to-many: which actions each role may perform';


-- =============================================================================
-- SECTION 3 : ADMIN USERS — Staff with system login
-- =============================================================================

CREATE TABLE admin_users (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id                 UUID            REFERENCES roles(id),
    -- Geographic scope (level depends on role)
    country_id              UUID            REFERENCES countries(id),
    region_id               UUID            REFERENCES regions(id),
    town_id                 UUID            REFERENCES towns(id),
    activity_centre_id      UUID            REFERENCES activity_centres(id),
    -- Identity
    first_name              VARCHAR(100)    NOT NULL,
    last_name               VARCHAR(100)    NOT NULL,
    email                   VARCHAR(255)    UNIQUE NOT NULL,
    phone                   VARCHAR(30),
    -- Auth
    password_hash           VARCHAR(255)    NOT NULL,
    status                  record_status   NOT NULL DEFAULT 'active',
    last_login_at           TIMESTAMPTZ,
    failed_login_attempts   SMALLINT        NOT NULL DEFAULT 0,
    locked_until            TIMESTAMPTZ,
    -- Audit
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by              UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE admin_users IS 'Staff / volunteer admins who log in to the management system';

-- Back-fill FK for role_permissions.granted_by
ALTER TABLE role_permissions
    ADD CONSTRAINT fk_rp_granted_by FOREIGN KEY (granted_by) REFERENCES admin_users(id);

CREATE TABLE otp_tokens (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id   UUID            NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    otp_code        VARCHAR(10)     NOT NULL,               -- hashed in production
    purpose         VARCHAR(50)     NOT NULL DEFAULT 'login', -- 'login', 'password_reset'
    expires_at      TIMESTAMPTZ     NOT NULL,
    used            BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE otp_tokens IS 'One-time passwords for 2FA login and password reset flows';


-- =============================================================================
-- SECTION 4 : MEMBERS — Full member profiles
-- =============================================================================

CREATE TABLE members (
    id                          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_number               VARCHAR(20)     UNIQUE,     -- 'WBL-001', 'BHM-042', …
    member_type                 member_type     NOT NULL,
    status                      member_status   NOT NULL DEFAULT 'pending',
    -- Name
    first_name                  VARCHAR(100)    NOT NULL,
    middle_name                 VARCHAR(100),
    surname                     VARCHAR(100)    NOT NULL,
    -- Contact
    email                       VARCHAR(255),
    secondary_email             VARCHAR(255),
    phone                       VARCHAR(30),
    secondary_phone             VARCHAR(30),
    -- Address
    building_name               VARCHAR(200),
    address_line1               VARCHAR(200),
    address_line2               VARCHAR(200),
    contact_town_city           VARCHAR(100),
    post_code                   VARCHAR(20),
    -- Personal
    date_of_birth               DATE            NOT NULL,
    gender                      gender_type     NOT NULL,
    occupation                  VARCHAR(200),
    originating_state_india     VARCHAR(100),
    -- HSS Geography (FK to masters)
    activity_centre_id          UUID            REFERENCES activity_centres(id),
    -- HSS Role
    role_type_id                UUID            REFERENCES role_types(id),
    org_role                    VARCHAR(100),               -- 'Volunteer', 'Member', 'Youth Member'
    admin_role                  VARCHAR(100),               -- internal admin designation
    responsibility_type         responsibility_type,
    responsibility_level        responsibility_level,
    -- Guardian details (for teens / children)
    guardian_name               VARCHAR(200),
    guardian_email              VARCHAR(255),
    guardian_phone              VARCHAR(30),
    guardian_relationship       VARCHAR(50),
    -- Emergency contact
    emergency_contact_name      VARCHAR(200),
    emergency_contact_phone     VARCHAR(30),
    emergency_contact_email     VARCHAR(255),
    emergency_contact_relationship VARCHAR(50),
    -- Medical
    medical_info_declared       BOOLEAN         NOT NULL DEFAULT FALSE,
    medical_info_details        TEXT,
    is_first_aider              BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Approval workflow
    registration_date           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    approved_at                 TIMESTAMPTZ,
    approved_by                 UUID            REFERENCES admin_users(id),
    rejected_at                 TIMESTAMPTZ,
    rejected_by                 UUID            REFERENCES admin_users(id),
    rejection_reason            TEXT,
    guardian_consent_at         TIMESTAMPTZ,               -- when parental consent was granted
    guardian_consent_admin_id   UUID            REFERENCES admin_users(id),
    -- Counters (denormalised for perf; kept in sync via triggers)
    events_attended             INT             NOT NULL DEFAULT 0,
    shakha_sessions_attended    INT             NOT NULL DEFAULT 0,
    -- Timestamps
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by                  UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE members IS 'Core member profiles — the primary entity of the system';

CREATE TABLE member_compliance (
    id                          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id                   UUID            NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    dbs_status                  compliance_status NOT NULL DEFAULT 'pending',
    dbs_ref                     VARCHAR(100),
    dbs_issued_date             DATE,
    dbs_expiry_date             DATE,
    dbs_renewal_requested_at    TIMESTAMPTZ,
    first_aid_status            compliance_status NOT NULL DEFAULT 'pending',
    first_aid_ref               VARCHAR(100),
    first_aid_expiry_date       DATE,
    parental_consent_status     consent_status  NOT NULL DEFAULT 'na',
    parental_consent_granted_at TIMESTAMPTZ,
    parental_consent_granted_by VARCHAR(200),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE member_compliance IS 'DBS, First Aid and Parental Consent records per member (1:1)';

CREATE TABLE member_dietary_requirements (
    member_id       UUID            NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    requirement     VARCHAR(100)    NOT NULL,
    PRIMARY KEY (member_id, requirement)
);

CREATE TABLE member_spoken_languages (
    member_id       UUID            NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    language        VARCHAR(100)    NOT NULL,
    PRIMARY KEY (member_id, language)
);

CREATE TABLE member_accounts (
    -- Portal login for members themselves (not admin staff)
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id       UUID            NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    email           VARCHAR(255)    UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    status          record_status   NOT NULL DEFAULT 'active',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE member_accounts IS 'Portal login credentials for Member (18+) and Teen self-service';


-- =============================================================================
-- SECTION 5 : EVENTS
-- =============================================================================

CREATE TABLE events (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_number            VARCHAR(20)     UNIQUE,         -- 'EVT-101', …
    name                    VARCHAR(300)    NOT NULL,
    description             TEXT,
    -- Scope
    activity_centre_id      UUID            REFERENCES activity_centres(id),
    host_admin_id           UUID            REFERENCES admin_users(id),
    host_name               VARCHAR(200),                   -- display name override
    -- Schedule
    start_date              TIMESTAMPTZ     NOT NULL,
    end_date                TIMESTAMPTZ     NOT NULL,
    -- Payment
    payment_type            payment_type    NOT NULL DEFAULT 'free',
    price                   NUMERIC(10,2),
    currency                CHAR(3)         NOT NULL DEFAULT 'GBP',
    -- Config
    capacity                INT,
    status                  event_status    NOT NULL DEFAULT 'draft',
    chat_state              chat_state      NOT NULL DEFAULT 'active',
    -- Cancellation
    cancelled_at            TIMESTAMPTZ,
    cancellation_reason     TEXT,
    cancelled_by            UUID            REFERENCES admin_users(id),
    -- Metrics (denormalised for read perf)
    rsvp_going              INT             NOT NULL DEFAULT 0,
    rsvp_maybe              INT             NOT NULL DEFAULT 0,
    rsvp_not_going          INT             NOT NULL DEFAULT 0,
    participant_count       INT             NOT NULL DEFAULT 0,
    media_count             INT             NOT NULL DEFAULT 0,
    -- Timestamps
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by              UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE events IS 'HSS events — workshops, sports days, galas, SSV, etc.';

CREATE TABLE event_co_hosts (
    event_id        UUID            NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    admin_user_id   UUID            REFERENCES admin_users(id),
    display_name    VARCHAR(200)    NOT NULL,
    PRIMARY KEY (event_id, display_name)
);

CREATE TABLE event_audience_filters (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        UUID            NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    filter_type     VARCHAR(50)     NOT NULL,               -- 'age_category', 'gender', 'job_title'
    filter_value    VARCHAR(100)    NOT NULL
);
COMMENT ON TABLE event_audience_filters IS 'Target audience criteria for an event (age, gender, job title)';

CREATE TABLE event_participants (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        UUID            NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    member_id       UUID            NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    rsvp_status     rsvp_status     NOT NULL DEFAULT 'going',
    registered_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    attended        BOOLEAN,                                -- marked post-event
    UNIQUE (event_id, member_id)
);
COMMENT ON TABLE event_participants IS 'Member RSVP / participation records per event';

CREATE TABLE event_payments (
    id                          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id                    UUID            NOT NULL REFERENCES events(id),
    member_id                   UUID            NOT NULL REFERENCES members(id),
    amount                      NUMERIC(10,2)   NOT NULL,
    currency                    CHAR(3)         NOT NULL DEFAULT 'GBP',
    status                      payment_status  NOT NULL DEFAULT 'pending',
    payment_method              VARCHAR(50),                -- 'card', 'bank_transfer', …
    stripe_payment_intent_id    VARCHAR(255),
    paid_at                     TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, member_id)
);
COMMENT ON TABLE event_payments IS 'Payment records for paid events — linked to Stripe';

CREATE TABLE event_media (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id                UUID            NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    uploaded_by_member_id   UUID            REFERENCES members(id),
    uploaded_by_name        VARCHAR(200),
    media_type              media_type      NOT NULL,
    caption                 TEXT,
    media_url               VARCHAR(1000),
    posted_at               TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE event_media IS 'Photos and videos uploaded to event media gallery';


-- =============================================================================
-- SECTION 6 : ANNOUNCEMENTS & NOTIFICATIONS
-- =============================================================================

CREATE TABLE announcements (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_number     VARCHAR(20)     UNIQUE,         -- 'ANN-001', …
    title                   VARCHAR(300)    NOT NULL,
    body                    TEXT            NOT NULL,
    content_type            content_type    NOT NULL DEFAULT 'text',
    media_url               VARCHAR(1000),
    cooldown_hours          INT             NOT NULL DEFAULT 0,
    priority                priority_level  NOT NULL DEFAULT 'medium',
    status                  announcement_status NOT NULL DEFAULT 'draft',
    -- Geographic scope
    scope                   announcement_scope NOT NULL DEFAULT 'national',
    target_country_id       UUID            REFERENCES countries(id),
    target_region_id        UUID            REFERENCES regions(id),
    target_town_id          UUID            REFERENCES towns(id),
    target_centre_id        UUID            REFERENCES activity_centres(id),
    -- Push notification
    push_enabled            BOOLEAN         NOT NULL DEFAULT FALSE,
    push_schedule           notification_schedule NOT NULL DEFAULT 'instant',
    push_scheduled_at       TIMESTAMPTZ,
    -- Email notification
    email_enabled           BOOLEAN         NOT NULL DEFAULT FALSE,
    email_schedule          notification_schedule NOT NULL DEFAULT 'instant',
    email_scheduled_at      TIMESTAMPTZ,
    -- Meta
    estimated_reach         INT             NOT NULL DEFAULT 0,
    sent_at                 TIMESTAMPTZ,
    posted_by_name          VARCHAR(200),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by              UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE announcements IS 'Broadcast communications with scope, scheduling and push/email delivery';

CREATE TABLE announcement_audience_filters (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id     UUID            NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    filter_type         VARCHAR(50)     NOT NULL,           -- 'age_category', 'gender', 'job_title'
    filter_value        VARCHAR(100)    NOT NULL
);

CREATE TABLE notification_deliveries (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id     UUID            NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    member_id           UUID            REFERENCES members(id),
    channel             notification_channel NOT NULL,
    sent_at             TIMESTAMPTZ,
    delivered           BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMPTZ
);
COMMENT ON TABLE notification_deliveries IS 'Per-member delivery tracking for push, email and bell notifications';

CREATE TABLE in_app_notifications (
    -- Bell icon notifications in the header
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id        UUID            NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    type                VARCHAR(50)     NOT NULL,           -- 'new_registration', 'event_created', 'donation', …
    title               VARCHAR(300)    NOT NULL,
    body                TEXT,
    reference_id        UUID,                               -- FK to the relevant record
    reference_type      VARCHAR(50),                        -- 'member', 'event', 'donation', …
    read                BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE in_app_notifications IS 'Real-time bell-icon notifications for admin users';


-- =============================================================================
-- SECTION 7 : ATTENDANCE — Shakha / Sessions
-- =============================================================================

CREATE TABLE shakha_sessions (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_number      VARCHAR(20)     UNIQUE,             -- 'SES-001', …
    title               VARCHAR(200)    NOT NULL,
    activity_centre_id  UUID            NOT NULL REFERENCES activity_centres(id),
    shakha_type         shakha_type,
    frequency           session_frequency NOT NULL,
    day_of_week         SMALLINT        CHECK (day_of_week BETWEEN 0 AND 6),
    start_time          TIME            NOT NULL,
    end_time            TIME            NOT NULL,
    session_date        DATE            NOT NULL,
    status              session_status  NOT NULL DEFAULT 'scheduled',
    total_expected      INT             NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_by          UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE shakha_sessions IS 'Individual Shakha session occurrences (recurring or one-off)';

CREATE TABLE session_attendance (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID                NOT NULL REFERENCES shakha_sessions(id) ON DELETE CASCADE,
    member_id       UUID                NOT NULL REFERENCES members(id),
    status          attendance_status   NOT NULL DEFAULT 'unmarked',
    marked_at       TIMESTAMPTZ,
    marked_by       UUID                REFERENCES admin_users(id),
    UNIQUE (session_id, member_id)
);
COMMENT ON TABLE session_attendance IS 'Attendance record per member per session';


-- =============================================================================
-- SECTION 8 : FINANCE — Donations & Refunds
-- =============================================================================

CREATE TABLE donations (
    id                          UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_number             VARCHAR(20)     UNIQUE,     -- 'DON-001', …
    member_id                   UUID            REFERENCES members(id),
    donor_name                  VARCHAR(200),               -- for non-member / anonymous donors
    donor_type                  donor_type      NOT NULL,
    amount                      NUMERIC(10,2)   NOT NULL,
    currency                    CHAR(3)         NOT NULL DEFAULT 'GBP',
    status                      donation_status NOT NULL DEFAULT 'pledged',
    channel                     donation_channel NOT NULL,
    -- Gift Aid
    gift_aid                    BOOLEAN         NOT NULL DEFAULT FALSE,
    gift_aid_amount             NUMERIC(10,2)   GENERATED ALWAYS AS
                                    (CASE WHEN gift_aid THEN ROUND(amount * 0.25, 2) ELSE 0 END) STORED,
    -- Scope
    activity_centre_id          UUID            REFERENCES activity_centres(id),
    -- Payment reference
    stripe_payment_intent_id    VARCHAR(255),
    bank_reference              VARCHAR(200),
    -- Timestamps
    donation_date               TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    received_at                 TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    recorded_by                 UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE donations IS 'Donations from members, families, organisations and anonymous donors';

CREATE TABLE refunds (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_number           VARCHAR(20)     UNIQUE,         -- 'REF-001', …
    event_id                UUID            REFERENCES events(id),
    event_payment_id        UUID            REFERENCES event_payments(id),
    member_id               UUID            REFERENCES members(id),
    requester_name          VARCHAR(200),
    amount                  NUMERIC(10,2)   NOT NULL,
    currency                CHAR(3)         NOT NULL DEFAULT 'GBP',
    status                  refund_status   NOT NULL DEFAULT 'requested',
    reason                  refund_reason   NOT NULL,
    notes                   TEXT,
    requested_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    processed_at            TIMESTAMPTZ,
    processed_by            UUID            REFERENCES admin_users(id),
    stripe_refund_id        VARCHAR(255),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE refunds IS 'Refund requests for event payments, linked to Stripe refunds';


-- =============================================================================
-- SECTION 9 : AUDIT & LOGGING
-- =============================================================================

CREATE TABLE audit_logs (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id   UUID                REFERENCES admin_users(id),
    user_name       VARCHAR(200),
    module          VARCHAR(100)        NOT NULL,
    action_type     audit_action_type   NOT NULL,
    record_id       VARCHAR(200),                           -- target record UUID as string
    record_name     VARCHAR(300),
    description     TEXT,
    before_state    JSONB,
    after_state     JSONB,
    changed_fields  TEXT[],
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE audit_logs IS 'Immutable audit trail — all create/update/delete/status changes';

CREATE TABLE login_logs (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id       UUID            REFERENCES admin_users(id),
    user_name           VARCHAR(200),
    email               VARCHAR(255),
    role_name           VARCHAR(100),
    login_time          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    logout_time         TIMESTAMPTZ,
    session_duration_s  INT,                                -- seconds; computed on logout
    ip_address          INET,
    device              VARCHAR(200),
    browser             VARCHAR(100),
    os                  VARCHAR(100),
    location            VARCHAR(200),
    status              login_status    NOT NULL,
    failure_reason      TEXT
);
COMMENT ON TABLE login_logs IS 'Authentication event log — successful and failed logins';

CREATE TABLE api_logs (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id       UUID            REFERENCES admin_users(id),
    user_name           VARCHAR(200),
    api_name            VARCHAR(200),
    endpoint            VARCHAR(1000)   NOT NULL,
    method              http_method     NOT NULL,
    status_code         SMALLINT        NOT NULL,
    duration_ms         INT,
    request_payload     JSONB,
    response_payload    JSONB,
    request_headers     JSONB,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE api_logs IS 'API request/response log for debugging and monitoring';

CREATE TABLE email_logs (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id     UUID            REFERENCES announcements(id),
    recipient_name      VARCHAR(200),
    recipient_email     VARCHAR(255)    NOT NULL,
    template_name       VARCHAR(200),
    subject             VARCHAR(500),
    status              VARCHAR(50)     NOT NULL DEFAULT 'sent',  -- 'sent', 'delivered', 'failed', 'bounced'
    failure_reason      TEXT,
    provider_message_id VARCHAR(255),
    triggered_by        VARCHAR(200),
    sent_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE email_logs IS 'Outbound email delivery log';


-- =============================================================================
-- SECTION 10 : SYSTEM CONFIGURATION
-- =============================================================================

CREATE TABLE system_settings (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    key             VARCHAR(200)    UNIQUE NOT NULL,        -- 'org_name', 'logo_url', …
    value           TEXT,
    value_type      VARCHAR(20)     NOT NULL DEFAULT 'string', -- 'string','boolean','number','json'
    group_name      VARCHAR(100),                           -- 'general', 'email', 'notifications', …
    label           VARCHAR(200),
    description     TEXT,
    is_public       BOOLEAN         NOT NULL DEFAULT FALSE,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_by      UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE system_settings IS 'Key-value store for platform-wide configuration';

CREATE TABLE static_pages (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(200)    UNIQUE NOT NULL,        -- 'terms-and-conditions', 'privacy-policy'
    title           VARCHAR(300)    NOT NULL,
    content         TEXT,
    status          record_status   NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_by      UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE static_pages IS 'CMS pages — Terms, Privacy Policy, About, etc.';

CREATE TABLE email_templates (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200)    UNIQUE NOT NULL,        -- 'Welcome Member', 'Event Reminder', …
    code            VARCHAR(100)    UNIQUE NOT NULL,        -- 'welcome_member', 'event_reminder', …
    subject         VARCHAR(500),
    html_body       TEXT,
    text_body       TEXT,
    variables       JSONB,                                  -- available template variables
    status          record_status   NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_by      UUID            REFERENCES admin_users(id)
);
COMMENT ON TABLE email_templates IS 'Reusable email templates for all system notifications';


-- =============================================================================
-- SECTION 11 : INDEXES
-- Covering the most common query patterns identified from the UI
-- =============================================================================

-- ── Geography ────────────────────────────────────────────────
CREATE INDEX idx_regions_country       ON regions(country_id);
CREATE INDEX idx_towns_region          ON towns(region_id);
CREATE INDEX idx_centres_town          ON activity_centres(town_id);

-- ── Members ──────────────────────────────────────────────────
CREATE INDEX idx_members_centre        ON members(activity_centre_id);
CREATE INDEX idx_members_status        ON members(status);
CREATE INDEX idx_members_email         ON members(email);
CREATE INDEX idx_members_number        ON members(member_number);
CREATE INDEX idx_members_dob           ON members(date_of_birth);
CREATE INDEX idx_members_role_type     ON members(role_type_id);
CREATE INDEX idx_members_created       ON members(created_at DESC);

-- ── Events ───────────────────────────────────────────────────
CREATE INDEX idx_events_centre         ON events(activity_centre_id);
CREATE INDEX idx_events_status         ON events(status);
CREATE INDEX idx_events_start          ON events(start_date);
CREATE INDEX idx_event_participants    ON event_participants(event_id, member_id);
CREATE INDEX idx_event_media_event     ON event_media(event_id);

-- ── Announcements ─────────────────────────────────────────────
CREATE INDEX idx_announcements_status  ON announcements(status);
CREATE INDEX idx_announcements_scope   ON announcements(scope);
CREATE INDEX idx_announcements_sent    ON announcements(sent_at DESC);

-- ── Attendance ────────────────────────────────────────────────
CREATE INDEX idx_sessions_centre       ON shakha_sessions(activity_centre_id);
CREATE INDEX idx_sessions_date         ON shakha_sessions(session_date DESC);
CREATE INDEX idx_attendance_session    ON session_attendance(session_id);
CREATE INDEX idx_attendance_member     ON session_attendance(member_id);

-- ── Finance ──────────────────────────────────────────────────
CREATE INDEX idx_donations_member      ON donations(member_id);
CREATE INDEX idx_donations_centre      ON donations(activity_centre_id);
CREATE INDEX idx_donations_date        ON donations(donation_date DESC);
CREATE INDEX idx_refunds_event         ON refunds(event_id);
CREATE INDEX idx_refunds_member        ON refunds(member_id);

-- ── Audit / Logs ─────────────────────────────────────────────
CREATE INDEX idx_audit_timestamp       ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_module          ON audit_logs(module);
CREATE INDEX idx_audit_user            ON audit_logs(admin_user_id);
CREATE INDEX idx_login_time            ON login_logs(login_time DESC);
CREATE INDEX idx_login_user            ON login_logs(admin_user_id);
CREATE INDEX idx_notif_recipient       ON in_app_notifications(recipient_id, read, created_at DESC);


-- =============================================================================
-- SECTION 12 : UTILITY TRIGGERS
-- =============================================================================

-- ── updated_at auto-update ────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'countries','regions','towns','activity_centres','role_types',
        'roles','admin_users','members','events','announcements',
        'shakha_sessions','donations','system_settings','static_pages','email_templates'
    ] LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %s
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
            t, t
        );
    END LOOP;
END;
$$;

-- ── Cascade member counters when attendance is marked ─────────
CREATE OR REPLACE FUNCTION fn_update_member_sessions_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'present' AND (OLD.status IS DISTINCT FROM 'present') THEN
        UPDATE members SET shakha_sessions_attended = shakha_sessions_attended + 1
        WHERE id = NEW.member_id;
    ELSIF OLD.status = 'present' AND NEW.status != 'present' THEN
        UPDATE members SET shakha_sessions_attended = GREATEST(shakha_sessions_attended - 1, 0)
        WHERE id = NEW.member_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_member_session_count
AFTER INSERT OR UPDATE ON session_attendance
FOR EACH ROW EXECUTE FUNCTION fn_update_member_sessions_count();

-- ── Cascade member event count when attendance confirmed ──────
CREATE OR REPLACE FUNCTION fn_update_member_event_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.attended = TRUE AND (OLD.attended IS DISTINCT FROM TRUE) THEN
        UPDATE members SET events_attended = events_attended + 1
        WHERE id = NEW.member_id;
    ELSIF OLD.attended = TRUE AND NEW.attended IS DISTINCT FROM TRUE THEN
        UPDATE members SET events_attended = GREATEST(events_attended - 1, 0)
        WHERE id = NEW.member_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_member_event_count
AFTER INSERT OR UPDATE ON event_participants
FOR EACH ROW EXECUTE FUNCTION fn_update_member_event_count();


-- =============================================================================
-- SECTION 13 : SEED — Reference / Master Data
-- =============================================================================

-- ── Modules & Actions ─────────────────────────────────────────
INSERT INTO modules (name, code, display_order) VALUES
    ('Dashboard',                   'dashboard',    1),
    ('Masters',                     'masters',      2),
    ('Members Management',          'members',      3),
    ('Events Management',           'events',       4),
    ('Announcements',               'announcements',5),
    ('Attendance',                  'attendance',   6),
    ('Reports',                     'reports',      7),
    ('Roles & Permissions (RBAC)',  'rbac',         8),
    ('Settings',                    'settings',     9),
    ('Audit Logging',               'audit_logs',  10);

-- ── Roles ────────────────────────────────────────────────────
INSERT INTO roles (name, code, description) VALUES
    ('Super Admin',          'super_admin',          'Full system access — Settings, Masters CRUD, Audit Logging'),
    ('National Head',        'national_head',        'National-level admin. Views all regions, towns and centres.'),
    ('Regional Head',        'regional_head',        'Regional-level admin. Views own region and below.'),
    ('Town Head',            'town_head',            'Town-level admin. Views own town and activity centres within it.'),
    ('Activity Centre Admin','activity_centre_admin','Manages own activity centre.'),
    ('Event Admin',          'event_admin',          'Creates and manages events. View-only members access.'),
    ('Reporting User',       'reporting_user',       'Read-only access with full report export capability.'),
    ('Ops User',             'ops_user',             'Attendance management staff.'),
    ('Member (18+)',         'member_adult',         'Adult member portal access.'),
    ('Teen (13-17)',         'member_teen',          'Teen member portal access. Guardian consent required.');

-- ── HSS Job Titles (Role Types) ───────────────────────────────
INSERT INTO role_types (name, sort_order) VALUES
    ('Ghatnayak',1),('Sankhya',2),('Shikshak',3),('Mukhya Shikshak',4),
    ('Karyawaha',5),('Shareerik',6),('Bauddhik',7),('Sewa',8),
    ('Sampark',9),('Nidhi',10),('Vyavestha',11),('Prachaar',12),
    ('Bal(ika)',13),('Shishu',14),('Kishor(i)',15),('Tarun(i)',16),
    ('Yuva(ti)',17),('Jyestha(a)',18),('Karyalay',19),('SSV',20),
    ('Vistaar',21),('Sanghchalak',22),('Hindu Sahitya Kendra',23);

-- ── System Settings defaults ──────────────────────────────────
INSERT INTO system_settings (key, value, value_type, group_name, label) VALUES
    ('org_name',        'Hindu Swayamsevak Sangh UK',   'string',  'general',   'Organisation Name'),
    ('org_email',       'info@hssuk.org',               'string',  'general',   'Organisation Email'),
    ('default_currency','GBP',                          'string',  'finance',   'Default Currency'),
    ('dbs_expiry_months','36',                          'number',  'compliance','DBS Validity (months)'),
    ('first_aid_expiry_months','36',                    'number',  'compliance','First Aid Validity (months)'),
    ('session_otp_minutes','10',                        'number',  'auth',      'OTP Expiry (minutes)');


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
