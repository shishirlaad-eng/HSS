-- =============================================================================
-- HSS MEMBERSHIP MANAGEMENT SYSTEM
-- MySQL 8+ schema: Authentication + Masters modules only
-- Source alignment:
--   - GitHub remote main verified at commit 5dec272c162f0d559f4cd265581fb340b4dcff8d
--   - Frontend MDs/1. Super_admin_authentication.md
--   - Frontend MDs/2. Super_admin_masters.md
--   - src/app/components/SuperAdminAuth.tsx
--   - src/app/components/SuperAdminMasters.tsx
--
-- Encryption requirement:
--   Use AES-256-CBC for reversible sensitive fields.
--   Before using AES_ENCRYPT/AES_DECRYPT in application sessions, set:
--     SET SESSION block_encryption_mode = 'aes-256-cbc';
--
-- Recommended write pattern for encrypted fields:
--   ciphertext = AES_ENCRYPT(plain_value, UNHEX(@app_aes_256_key_hex), iv)
--   iv         = RANDOM_BYTES(16)
--   digest     = UNHEX(SHA2(LOWER(TRIM(plain_value)), 256)) for lookup columns
-- =============================================================================

CREATE DATABASE IF NOT EXISTS hss_membership
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE hss_membership;

-- =============================================================================
-- 1. MASTERS
-- Frontend tabs: Country, Region, Town, Activity Centre, Responsibility.
-- =============================================================================

CREATE TABLE countries (
  country_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(20) NOT NULL,
  country_name VARCHAR(120) NOT NULL,
  country_code VARCHAR(30) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  version_no INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (country_id),
  UNIQUE KEY uq_countries_public_id (public_id),
  UNIQUE KEY uq_countries_name (country_name),
  KEY ix_countries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Masters: Country / Organization / National records.';

CREATE TABLE regions (
  region_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(20) NOT NULL,
  country_id BIGINT UNSIGNED NOT NULL,
  region_name VARCHAR(120) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  version_no INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (region_id),
  UNIQUE KEY uq_regions_public_id (public_id),
  UNIQUE KEY uq_regions_country_name (country_id, region_name),
  KEY ix_regions_status (status),
  CONSTRAINT fk_regions_country
    FOREIGN KEY (country_id) REFERENCES countries(country_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Masters: Regions linked to one Country.';

CREATE TABLE towns (
  town_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(20) NOT NULL,
  country_id BIGINT UNSIGNED NOT NULL,
  region_id BIGINT UNSIGNED NOT NULL,
  town_name VARCHAR(120) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  version_no INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (town_id),
  UNIQUE KEY uq_towns_public_id (public_id),
  UNIQUE KEY uq_towns_region_name (region_id, town_name),
  KEY ix_towns_country_region (country_id, region_id),
  KEY ix_towns_status (status),
  CONSTRAINT fk_towns_country
    FOREIGN KEY (country_id) REFERENCES countries(country_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_towns_region
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Masters: Towns linked to one Region.';

CREATE TABLE activity_centres (
  activity_centre_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(20) NOT NULL,
  country_id BIGINT UNSIGNED NOT NULL,
  region_id BIGINT UNSIGNED NOT NULL,
  town_id BIGINT UNSIGNED NOT NULL,
  activity_centre_name VARCHAR(160) NOT NULL,
  contact_name_cipher VARBINARY(512) NULL,
  contact_name_iv BINARY(16) NULL,
  contact_phone_cipher VARBINARY(512) NULL,
  contact_phone_iv BINARY(16) NULL,
  contact_email_cipher VARBINARY(512) NULL,
  contact_email_iv BINARY(16) NULL,
  contact_email_digest BINARY(32) NULL,
  address_line1_cipher VARBINARY(512) NULL,
  address_line1_iv BINARY(16) NULL,
  address_line2_cipher VARBINARY(512) NULL,
  address_line2_iv BINARY(16) NULL,
  city VARCHAR(120) NULL,
  post_code VARCHAR(20) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  version_no INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (activity_centre_id),
  UNIQUE KEY uq_activity_centres_public_id (public_id),
  UNIQUE KEY uq_activity_centres_town_name (town_id, activity_centre_name),
  UNIQUE KEY uq_activity_centres_contact_email_digest (contact_email_digest),
  KEY ix_activity_centres_geo (country_id, region_id, town_id),
  KEY ix_activity_centres_status (status),
  CONSTRAINT fk_activity_centres_country
    FOREIGN KEY (country_id) REFERENCES countries(country_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_activity_centres_region
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_activity_centres_town
    FOREIGN KEY (town_id) REFERENCES towns(town_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Masters: Activity Centres linked to one Town; contact/address fields use AES-256-CBC.';

CREATE TABLE role_types (
  role_type_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(20) NOT NULL,
  role_type_name VARCHAR(120) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  version_no INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (role_type_id),
  UNIQUE KEY uq_role_types_public_id (public_id),
  UNIQUE KEY uq_role_types_name (role_type_name),
  KEY ix_role_types_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Masters: Responsibility / Role Type reference list.';

-- =============================================================================
-- 2. AUTHORIZATION FOR AUTH + MASTERS
-- Frontend roles use masters actions: view, add, edit, delete, status.
-- =============================================================================

CREATE TABLE auth_roles (
  role_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(120) NOT NULL,
  role_code VARCHAR(80) NOT NULL,
  description VARCHAR(500) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (role_id),
  UNIQUE KEY uq_auth_roles_name (role_name),
  UNIQUE KEY uq_auth_roles_code (role_code),
  KEY ix_auth_roles_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Authentication roles, including Super Admin.';

CREATE TABLE auth_modules (
  module_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_name VARCHAR(120) NOT NULL,
  module_code VARCHAR(80) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (module_id),
  UNIQUE KEY uq_auth_modules_code (module_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Only modules needed for this schema: authentication and masters.';

CREATE TABLE auth_module_actions (
  module_action_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id BIGINT UNSIGNED NOT NULL,
  action_name VARCHAR(120) NOT NULL,
  action_code VARCHAR(100) NOT NULL,
  PRIMARY KEY (module_action_id),
  UNIQUE KEY uq_auth_module_actions_code (action_code),
  UNIQUE KEY uq_auth_module_actions_module_code (module_id, action_code),
  CONSTRAINT fk_auth_module_actions_module
    FOREIGN KEY (module_id) REFERENCES auth_modules(module_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Action permissions such as masters_view, masters_add, auth_login.';

CREATE TABLE auth_role_permissions (
  role_permission_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  module_action_id BIGINT UNSIGNED NOT NULL,
  is_granted TINYINT(1) NOT NULL DEFAULT 1,
  granted_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  granted_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (role_permission_id),
  UNIQUE KEY uq_auth_role_permissions (role_id, module_action_id),
  CONSTRAINT fk_auth_role_permissions_role
    FOREIGN KEY (role_id) REFERENCES auth_roles(role_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_auth_role_permissions_action
    FOREIGN KEY (module_action_id) REFERENCES auth_module_actions(module_action_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Role to module-action grants.';

-- =============================================================================
-- 3. AUTHENTICATION
-- Frontend screens: Login, OTP Verification, Forgot Password, Reset Password,
-- Logout. AES-256-CBC is used for reversible identity/contact fields only.
-- =============================================================================

CREATE TABLE admin_users (
  admin_user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  country_id BIGINT UNSIGNED NULL,
  region_id BIGINT UNSIGNED NULL,
  town_id BIGINT UNSIGNED NULL,
  activity_centre_id BIGINT UNSIGNED NULL,
  first_name_cipher VARBINARY(512) NULL,
  first_name_iv BINARY(16) NULL,
  last_name_cipher VARBINARY(512) NULL,
  last_name_iv BINARY(16) NULL,
  email_cipher VARBINARY(512) NOT NULL,
  email_iv BINARY(16) NOT NULL,
  email_digest BINARY(32) NOT NULL,
  phone_cipher VARBINARY(512) NULL,
  phone_iv BINARY(16) NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_changed_at TIMESTAMP(6) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  failed_login_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until TIMESTAMP(6) NULL,
  last_login_at TIMESTAMP(6) NULL,
  last_logout_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  version_no INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (admin_user_id),
  UNIQUE KEY uq_admin_users_email_digest (email_digest),
  KEY ix_admin_users_role_status (role_id, status),
  KEY ix_admin_users_geo (country_id, region_id, town_id, activity_centre_id),
  CONSTRAINT fk_admin_users_role
    FOREIGN KEY (role_id) REFERENCES auth_roles(role_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_admin_users_country
    FOREIGN KEY (country_id) REFERENCES countries(country_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_admin_users_region
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_admin_users_town
    FOREIGN KEY (town_id) REFERENCES towns(town_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_admin_users_activity_centre
    FOREIGN KEY (activity_centre_id) REFERENCES activity_centres(activity_centre_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Super/admin login accounts; names, email and phone use AES-256-CBC with lookup digest for email.';

ALTER TABLE countries
  ADD CONSTRAINT fk_countries_created_by FOREIGN KEY (created_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_countries_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL;

ALTER TABLE regions
  ADD CONSTRAINT fk_regions_created_by FOREIGN KEY (created_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_regions_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL;

ALTER TABLE towns
  ADD CONSTRAINT fk_towns_created_by FOREIGN KEY (created_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_towns_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL;

ALTER TABLE activity_centres
  ADD CONSTRAINT fk_activity_centres_created_by FOREIGN KEY (created_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_activity_centres_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL;

ALTER TABLE role_types
  ADD CONSTRAINT fk_role_types_created_by FOREIGN KEY (created_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_role_types_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(admin_user_id) ON DELETE SET NULL;

ALTER TABLE auth_role_permissions
  ADD CONSTRAINT fk_auth_role_permissions_granted_by
    FOREIGN KEY (granted_by) REFERENCES admin_users(admin_user_id)
    ON UPDATE CASCADE ON DELETE SET NULL;

CREATE TABLE auth_otp_challenges (
  otp_challenge_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  purpose ENUM('login', 'password_reset') NOT NULL,
  otp_hash BINARY(32) NOT NULL,
  delivery_channel ENUM('email', 'sms') NOT NULL DEFAULT 'email',
  destination_cipher VARBINARY(512) NULL,
  destination_iv BINARY(16) NULL,
  expires_at TIMESTAMP(6) NOT NULL,
  used_at TIMESTAMP(6) NULL,
  resend_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  verify_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (otp_challenge_id),
  KEY ix_auth_otp_user_purpose (admin_user_id, purpose, expires_at),
  KEY ix_auth_otp_hash (otp_hash),
  CONSTRAINT fk_auth_otp_admin_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(admin_user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Login and reset-password OTP challenges; destination uses AES-256-CBC.';

CREATE TABLE auth_sessions (
  session_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  session_token_hash BINARY(32) NOT NULL,
  refresh_token_hash BINARY(32) NULL,
  ip_address VARBINARY(16) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  expires_at TIMESTAMP(6) NOT NULL,
  revoked_at TIMESTAMP(6) NULL,
  revoked_reason VARCHAR(120) NULL,
  PRIMARY KEY (session_id),
  UNIQUE KEY uq_auth_sessions_token_hash (session_token_hash),
  UNIQUE KEY uq_auth_sessions_refresh_hash (refresh_token_hash),
  KEY ix_auth_sessions_user_expires (admin_user_id, expires_at),
  CONSTRAINT fk_auth_sessions_admin_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(admin_user_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Authenticated admin web sessions for OTP-verified logins and logout.';

CREATE TABLE auth_password_reset_requests (
  reset_request_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  reset_token_hash BINARY(32) NULL,
  otp_challenge_id BIGINT UNSIGNED NULL,
  requested_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  expires_at TIMESTAMP(6) NOT NULL,
  completed_at TIMESTAMP(6) NULL,
  request_ip VARBINARY(16) NULL,
  user_agent VARCHAR(500) NULL,
  PRIMARY KEY (reset_request_id),
  UNIQUE KEY uq_auth_password_reset_token (reset_token_hash),
  KEY ix_auth_password_reset_user (admin_user_id, requested_at),
  CONSTRAINT fk_auth_password_reset_admin_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(admin_user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_auth_password_reset_otp
    FOREIGN KEY (otp_challenge_id) REFERENCES auth_otp_challenges(otp_challenge_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Forgot-password and reset-password request tracking.';

CREATE TABLE auth_password_history (
  password_history_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  changed_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (password_history_id),
  KEY ix_auth_password_history_user (admin_user_id, changed_at),
  CONSTRAINT fk_auth_password_history_admin_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(admin_user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_auth_password_history_changed_by
    FOREIGN KEY (changed_by) REFERENCES admin_users(admin_user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Password history for reset policy enforcement.';

CREATE TABLE auth_login_audit (
  login_audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_user_id BIGINT UNSIGNED NULL,
  email_digest BINARY(32) NULL,
  event_type ENUM('login_attempt', 'otp_sent', 'otp_verified', 'password_reset_requested', 'password_reset_completed', 'logout') NOT NULL,
  result ENUM('success', 'failed', 'blocked') NOT NULL,
  failure_reason VARCHAR(160) NULL,
  ip_address VARBINARY(16) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (login_audit_id),
  KEY ix_auth_login_audit_user_time (admin_user_id, created_at),
  KEY ix_auth_login_audit_email_time (email_digest, created_at),
  KEY ix_auth_login_audit_event_result (event_type, result),
  CONSTRAINT fk_auth_login_audit_admin_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(admin_user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Audit trail for authentication screens and lockout/rate-limit decisions.';
