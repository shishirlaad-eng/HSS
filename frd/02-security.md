# 02 — Security

**Maps to Doc tab:** Security
**Source policies:** HSS (UK) Data Protection Policy.pdf · HSS (UK) Privacy Policy.pdf

---

## 1. Data Residency & Hosting
Hosted on Microsoft Azure within the UK region — all data remains within the UK. Azure
provides enterprise-grade physical and network security: DDoS protection, firewalls,
private networking, and infrastructure safeguards.

## 2. Access Control & Environment Segregation
Principle of least privilege:
- Strict role-based access control (RBAC) enforced
- Separate Dev / QA / Production environments
- No direct access to production databases for development teams

## 3. Data Encryption
- All data encrypted in transit using TLS 1.2+
- PII-sensitive data at rest encrypted using AES-256

## 4. Secure Development Practices
- No live production data used in development or testing
- Data masking/anonymisation applied where necessary

## 5. Audit & Monitoring
- Comprehensive audit logs maintained for data access, modifications, and administrative actions

## 6. Operational & Process Controls
- Access to sensitive systems is approval-based and time-bound
- No data stored locally by team members
- Regular internal security reviews and best-practice adherence

---

> **[FRONTEND-RECONCILE]** No direct frontend impact in this tab, but confirm that any
> client-side handling of PII (masking in lists, document download links) matches the
> masking rules referenced here and in the Members module.
