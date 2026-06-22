# 01 — Technical Specification

**Gate:** Gate 3 — Technical Specifications · **Maps to Doc tab:** Technical specification
**Platform:** Web Frontend, Mobile App, Backend API, MySQL, Azure Blob Storage
**Roles:** Role-based + scope-based permissions · **Risk Level:** Medium

> This tab defines the technical architecture, API standards, database rules, security
> baseline, and non-functional requirements. It must stay detailed enough to generate
> developer `.md` files without guessing. **Do not drop this tab when publishing.**

---

## 1. Application Layers

### 1.1 Frontend (UI)
- Web Frontend: ReactJS
- Mobile: React Native (iOS + Android)
- Client ↔ Backend communication: REST APIs
- Auth handling: **[CONFIRMATION REQUIRED — Blocking (Q1)]** Template allows JWT/cookies.
  Preferred: Web → JWT in HttpOnly cookies; Mobile → Bearer tokens + cookies/sessions where required.
- State management: **[TBD — Non-Blocking]** (Redux / Context API / Zustand — specify)
- Frontend contains NO business logic (all validation/state transitions server-side).

### 1.2 Backend (API Layer)
- Runtime: Node.js with NestJS framework
- API style: REST
- Responsibilities: provides REST APIs for all modules; performs business validations and
  orchestration (server-side + client-side); generates Swagger for API documentation.
- Web server / reverse proxy: Nginx

### 1.3 Database (CONFIRMED)
- Type: Relational DB
- Choice: MySQL
- Time handling: persisted timestamps in UTC; business display timezone UK (GMT/BST).

### 1.4 Document Storage
- Azure Blob Storage — compliance documents (DBS / First Aid) and future file uploads.
- May require Azure Key Vault to keep credentials safe.
- Global constraints: max upload 10 MB per file; access private; downloads role/scope controlled.

### 1.5 External Integrations

| Integration | Purpose | Direction | Protocol | Status |
|-------------|---------|-----------|----------|--------|
| Stripe | Event payments, donations, refunds | Outbound | REST | In scope |
| Email/SMS Notification | OTP and notifications | Outbound | SMTP / API | In scope (provider/account **[TBD]**) |
| Redis | Cache (listing APIs, KPI dashboards) | Internal | — | In scope |
| CI/CD | Build/deploy pipeline | Internal | — | **[TBD — Non-Blocking (Q8)]** Jenkins or GitLab CI/CD |

---

## 2. Database Architecture

### 2.1 Schema Rules
- Normalized schema (3NF minimum)
- Strong relationships with foreign key constraints
- Cascading rules explicitly defined per relationship (CASCADE / RESTRICT / SET NULL)
- Audit fields on every table (`created_at`, `updated_at`, `created_by`, `updated_by`)
- Soft delete column (`deleted_at`, nullable) on all deletable entities; not on master/reference tables
- Encryption: AES-256-GCM for defined PII fields
- Blind indexing for searching/filtering on encrypted fields

### 2.2 Environments

| Environment | Purpose | Deployment Frequency |
|-------------|---------|---------------------|
| Dev | Daily development | Multiple per day |
| QA / UAT | Testing and client review | Per sprint / release |
| Production | Live system | Controlled release |

Separate, fully isolated databases and storage per environment.

---

## 3. API Specifications (REST)

### 3.1 API Standards — required per endpoint
URL · HTTP method · purpose · auth required (Yes/No + role) · request params (query/path/body) ·
request body example · success response example · error responses · validation rules ·
role-based + scope-based permissions.

### 3.2 Standard Request/Response Format

**Success (as used in source FRD):**
```json
{ "data": [], "pagination": { "page": 1, "size": 20, "total": 0 } }
```

**Error (as used in source FRD):**
```json
{ "error": true, "message": "Unauthorized" }
```

> **[FRONTEND-RECONCILE / Dev decision]** The frd-studio Gate 3 reference defines a richer
> envelope (`success`, `message`, `failureCategory`, `errorCode`, `correlationId`). The source
> FRD uses the simpler envelope above. Confirm which envelope the frontend actually consumes
> and standardize before backend build. **[TBD — Blocking-adjacent]**

### 3.3 Error Code Format
`<MODULE>_<CATEGORY>_<NUMBER>` — e.g. `AUTH_VALIDATION_001`, `USER_OTP_003`, `EVENT_EDIT_CUTOFF_REACHED`.

### 3.4 HTTP Status Codes

| Code | When |
|------|------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Validation error / bad input |
| 401 | Unauthenticated / session expired |
| 403 | Unauthorized (authenticated, no permission) |
| 404 | Not found |
| 409 | Conflict (duplicate, stale state, cutoff reached) |
| 422 | Unprocessable entity |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | External dependency failure |

### 3.5 Failure Taxonomy

| Category | Description | Retry Allowed |
|----------|-------------|---------------|
| Validation | Client input errors | No |
| Authentication | Invalid/expired credentials | No |
| Authorization | Access denied | No |
| External Dependency | Third-party (Stripe/OTP) failure | Yes |
| System | Internal unexpected error | Limited |

### 3.6 API Grouping
Auth · Member/Teen/Child Profiles · Child Management · Consent · Attendance · Events ·
Event Registrations · Payments & Refunds · Announcements · Notifications · Reports/Dashboard ·
Masters · Roles & Permissions · Incident Logging · Data Migration.

### 3.7 Performance Requirements

| Operation | Target |
|-----------|--------|
| Listing / search APIs | < 2 s (varies with field count / related data) |
| Dashboard KPIs | < 3 s (source NFR section states < 4 s — **[TBD reconcile: 3 s vs 4 s]**) |
| Document downloads / PDF generation | < 5 s |
| Pagination | Up to 500 rows |
| Standard page size | 20 rows (configurable) |
| Testing | Unit tests + integration tests per module |

---

## 4. Logging & Monitoring

### 4.1 Minimum logs
Login events · status updates · Masters edits · payment confirmations · document downloads.

### 4.2 Project-driven audit targets
Consent approvals/rejections · child linking approvals · event registration approvals/rejections ·
refund actions · report exports · Masters changes · role/permission changes.

### 4.3 Structured Log Format
Structured JSON. Mandatory fields: `correlationId`, `requestId`, `moduleName`, `action`,
`actorId` (if authenticated), `actorRole` (if applicable), `entityId` (optional), `result`
(`success`/`failure`), `failureCategory` (if failure), `timestampUtc`.

**Never log:** passwords, tokens, OTPs, secrets, raw PII.

---

## 5. Security

### 5.1 Authentication
- Standard: **[TBD — Blocking (Q1)]** JWT / cookies as above.
- Token storage: httpOnly secure cookie (web), Bearer (mobile).
- Token expiry: **[TBD — confirm]** (e.g. Access 15 min, Refresh 7 days).
- Session idle timeout: 60 min default (Gate 2 Global Rules; configurable in Settings).

### 5.2 Rate Limiting & Abuse Protection

| Endpoint Type | Limit | Action on Breach |
|---------------|-------|-----------------|
| Login | 5 failed / 15 min | Account lockout 15 min |
| OTP verification | 5 invalid / 10 min | Lockout 15 min |
| OTP resend | 60 s cooldown; 3 / 15 min; 10 / 24h | Block resend |
| General APIs | 120 req/min/IP | 429 response |
| Temporary IP block | 20 failed logins / 15 min from IP | 30 min (escalates 60 min / 24h) |

### 5.3 Encryption
- In transit: TLS 1.2+ everywhere — web/mobile ↔ API, API ↔ MySQL, API ↔ Azure Blob, API ↔ Stripe/OTP.
- At rest: MySQL encryption at rest (DB + backups + snapshots) **[TBD confirm enabled]**;
  Azure Blob encryption at rest **[TBD confirm enabled]**; AES-256 for PII fields.
- Password hashing: bcrypt (salted).
- Key management: Azure Key Vault CMK for Blob **[TBD]**.

### 5.4 Input Validation
- Server-side strict validation on all inputs; reject unknown fields.
- Prevent SQL injection, XSS, SSRF, command injection.
- Sanitize all user content before storage/display.

### 5.5 PII Protection
- Scope enforcement via Masters.
- Anti-enumeration in auth/guardian email flows.
- Export governance **[TBD]** (formats/limits/watermark/audit).

### 5.6 GDPR Alignment
- Auditability for sensitive actions (approvals, refunds, exports, Masters changes).
- Data minimization and retention rules **[TBD — Needs Confirmation]**.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Scalability | Horizontal scaling supported; stateless backend |
| Availability | **[TBD — confirm SLA, e.g. 99.5%]** |
| Reliability | Graceful degradation during external dependency failures |
| Maintainability | Modular architecture; no cross-module direct DB access |
| Disaster Recovery | See backup values below |
| Browser Support | **[TBD — e.g. latest 2 versions Chrome/Firefox/Safari/Edge]** |
| Mobile OS Support | **[TBD — e.g. iOS 14+, Android 10+]** |

### 6.1 Backup Values (selected)

| Parameter | Value |
|-----------|-------|
| Backup frequency | Daily |
| Retention | 30 days |
| RTO | 8 hours |
| RPO | 24 hours |

### 6.2 Balanced option (common for membership systems — for discussion)

| Parameter | Value |
|-----------|-------|
| DB | Daily full |
| Retention | 30 days |
| RTO | 2–4 hours |
| RPO | 15–30 minutes |

> **[TBD]** Confirm whether 6.1 (current) or 6.2 (balanced) backup posture is adopted.
> File/document backups (Azure Blob): versioning + soft delete or periodic snapshots.

---

## 7. MD Readiness Checklist

| Dev File | Covered By | Status |
|----------|-----------|--------|
| `system/architecture.md` | §1, §5 | ✅ |
| `system/terminology.md` | Global §4 (roles) | ✅ |
| `specs/01_overview.md` | Global §1 | ✅ |
| `specs/02_global_user_stories.md` | module files | ✅ |
| `specs/03_global_api_design.md` | §3 | ✅ |
| `specs/04_global_data_models.md` | module §9 + DB §2 | ⚠️ Gap — entity-level schema not yet drawn |
| `specs/05_global_business_rules.md` | module §4 | ✅ |
| `specs/06_global_acceptance_criteria.md` | module §7 | ✅ |
| `specs/07_nonfunctional.md` | §6 | ✅ |
| `specs/10_risk_register.md` | Global §10 | ✅ |

**Blocking gaps:** Q1 (auth strategy) and Q2 (CSRF) must close before backend build;
detailed entity schema/ER model to be produced during technical design.

---

## 8. Open Questions / TBDs (Technical)

| # | Question | Blocking? | Owner | Status |
|---|----------|-----------|-------|--------|
| Q1 | Auth strategy (JWT cookies + Bearer vs unified Bearer) | 🔴 Yes | Client + Dev | Open |
| Q2 | CSRF strategy (depends on Q1) | 🔴 Yes | Dev | Open |
| T1 | Success/error envelope: simple (source) vs rich (frd-studio) — which does frontend consume? | 🔴-adjacent | Dev | Open |
| T2 | Dashboard KPI target: 3 s (Global) vs 4 s (Tech NFR) | 🟡 No | Dev | Open |
| T3 | At-rest encryption enabled on MySQL + Blob — confirm | 🟡 No | DevOps | Open |
| T4 | Key management: Azure Key Vault CMK for Blob — confirm | 🟡 No | DevOps | Open |
| T5 | Backup posture: current (6.1) vs balanced (6.2) | 🟡 No | Client + DevOps | Open |
| Q8 | CI/CD toolchain (Jenkins vs GitLab CI/CD) | 🟡 No | Dev | Open |

> **[FRONTEND-RECONCILE]** Confirm the frontend's actual API base URL pattern, auth token
> handling (cookie vs header), and error-envelope parsing against this spec once the
> prototype is available to Claude Code on your machine.
