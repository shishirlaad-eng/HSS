# Member Registration Status Flow — Brainstorm & Gap Analysis

Status: Draft / not yet folded into `frd/05-members.md`. Working notes only — nothing here has been published.
Date: 2026-07-09

## 1. What triggered this

The current status enum is:

```
PENDING_PARENTAL_CONSENT, REGISTERED, PENDING_GUARDIAN_APPROVAL,
PENDING_APPROVAL, ACTIVE, REJECTED, INACTIVE, DELETED
```

The uploaded `Member Registration Flow` diagram routes on a simple two-way age split (13-17 vs. 18+/<13). Your written flow describes a three-way split (Child, Teen, Adult) using the Bal/Shishu/Kishor/Tarun+ age bands, plus a Child-specific email-matching branch that the diagram doesn't show at all. This note reconciles the two, closes the gaps, and proposes a revised flow.

## 2. Decisions made (confirmed with you)

| Question | Decision |
|---|---|
| Does Child (0-11) require guardian consent? | Yes — treated like Teen, but with its own status: `PENDING_PARENTAL_CONSENT` (Child) is distinct from `PENDING_GUARDIAN_APPROVAL` (Teen). This also explains why both statuses already existed in your enum — they were never duplicates. |
| Is "guardian approved" a real status? | Yes — added as an explicit `GUARDIAN_APPROVED` status, sitting between the guardian's approval and admin review. Gives a clean audit trail and a filterable "approved by guardian, awaiting admin" queue. |
| Do we distinguish who rejected a registration? | Yes, via a field rather than a new status: `REJECTED` stays a single status, with `rejected_by` (`GUARDIAN` \| `ADMIN`) and a mandatory `rejection_reason`. |
| Child registered with a non-matching email — what happens? | The system sends a claim/verification email to that address before the record is treated as consented. No silent attach. This becomes a sub-case of `PENDING_PARENTAL_CONSENT` (see `guardian_link_type` below), not a new status. |

## 3. Proposed status model (v2)

Keep the enum, but stop overloading it — split out fields that were being implicitly encoded into status names.

**Statuses**

| Status | Meaning | Applies to |
|---|---|---|
| `REGISTERED` | Profile created. `email_verified` (bool) is a separate field, not a status. Used both at initial signup and after a resubmission. | All |
| `PENDING_PARENTAL_CONSENT` | Awaiting parent/guardian response, Child path. | Child (0-11) |
| `PENDING_GUARDIAN_APPROVAL` | Awaiting guardian response, Teen path. | Teen (12-16) |
| `GUARDIAN_APPROVED` | Guardian/parent has approved; queued for admin. | Child, Teen |
| `PENDING_APPROVAL` | Awaiting admin (Vibhaag/Nagar/Shakha/Kendriya/Super Admin) review. | All (direct for Adult, downstream of `GUARDIAN_APPROVED` for Child/Teen) |
| `ACTIVE` | Admin approved. | All |
| `REJECTED` | Rejected by guardian or admin. Carries `rejected_by` + `rejection_reason`. | All |
| `INACTIVE` | Post-activation deactivation. Not part of registration — lifecycle only. | All |
| `DELETED` | Soft-deleted / erased. | All |

**New supporting fields (not statuses)**

- `email_verified: boolean`
- `rejected_by: GUARDIAN | ADMIN`
- `rejection_reason: string` (mandatory when `REJECTED`)
- `guardian_link_type: EXISTING_MEMBER | NEW_CLAIM` — Child path only; tracks whether the entered email matched an existing HSS member or is an unclaimed new contact. Needed for analytics (are we losing children because the parent's email never completes the claim step?) without adding another status.
- `consent_link_sent_at`, `consent_link_expires_at`, `reminder_sent_at`, `escalated_to_super_admin: boolean`
- `submission_count: integer` — increments on each resubmission after rejection.

## 4. Gaps found against the uploaded diagram and your written flow

**4.1 Age-band boundary mismatch.** The diagram splits at 13/18 ("Age 13-17" vs. "Age 18+ or <13"). Your reference bands split at 12/17 (Kishor 12-16 = Teen, Tarun+ 17+ = Adult), and Child (Bal 0-5 + Shishu 6-11) is its own band the diagram doesn't route separately at all — it currently falls into "no PG details needed," which contradicts your written flow. The revised diagram (below) uses a three-way decision: 0-11 / 12-16 / 17+.

**4.2 No expiry/timeout path.** The diagram shows "Send Email Link to Parent/Guardian (Valid 7 Days)" but has no branch for what happens if nobody responds. There's a manual "Super Admin can act if PG unable to" node, but nothing triggers it automatically. Recommend: reminder at day 4, auto-escalate to Super Admin queue at day 7 for Teen. The new Child/NEW_CLAIM sub-case (recipient didn't initiate registration, may not even have an account) likely needs a longer window — e.g. day 14 — since response rates will be lower. **[TBD — Needs Confirmation: exact cadence/days]**

**4.3 Resubmission vs. guardian re-approval — diagram and text disagree.** The diagram's dashed "Resubmit — Restart routing" loop goes all the way back to the Age-Based Routing decision, implying a resubmitted Child/Teen record re-runs guardian approval from scratch. Your written flow says resubmission goes straight back to `REGISTERED` → admin approval, skipping guardian re-approval entirely. These can't both be right. Recommend: only re-trigger guardian approval if guardian-relevant fields changed (shakha, contact info, the fields the guardian actually consented to); pure admin-facing edits skip straight to `PENDING_APPROVAL`. **[TBD — Needs Confirmation]**

**4.4 Mid-flight age transition.** If a Kishor(i) turns 17 while sitting in `PENDING_GUARDIAN_APPROVAL` or `GUARDIAN_APPROVED`, does the record stay on the path it started on, or does the system re-route it as an Adult? Recommend freezing the age-band decision at submission time — don't re-evaluate retroactively — to avoid a guardian-approved record suddenly requiring re-approval. **[TBD — Needs Confirmation]**

**4.5 Guardian decline vs. dispute.** The diagram's "Reject" path assumes a routine decline. It doesn't distinguish a normal decline ("not right now") from a dispute ("this isn't my child" / fraudulent email entry). The latter probably warrants a different handling path (flagging, rate-limiting repeat attempts against the same guardian email) rather than just "member edits and resubmits." Not covered today.

**4.6 Super Admin override scope.** The diagram draws the Super Admin override ("can act if PG unable to") only on the Teen lane. Now that Child also has a guardian/consent lane, confirm the override applies there too — almost certainly yes given Child consent is the more sensitive case, but worth an explicit yes. **[TBD — Needs Confirmation]**

**4.7 Shared parent/child email — verification and login.** If a parent's email is already verified (they have their own `ACTIVE` account), does a new child profile registered under that same email need to redo email verification? Recommend: no — skip straight to `PENDING_PARENTAL_CONSENT` if the email matches an already-verified member. Separately: "user will be able to login with the email id for child profile" implies one mailbox can front multiple profiles (parent + one or more children). That needs a profile-switcher at login — this is an architecture question beyond the status model, flagging it so it doesn't get lost.

**4.8 No cap on email-verification resend loop.** Step 1B loops indefinitely if the user never verifies. No limit, no cleanup policy for abandoned signups. Minor, but worth a data-hygiene decision (e.g., auto-expire unverified `REGISTERED` accounts after 30 days).

**4.9 `INACTIVE` and `DELETED` are unaddressed by the registration flow.** Both exist in the enum but neither the diagram nor your written flow says what triggers them. At minimum: is there a retention/auto-purge policy for Child records that never get consented (COPPA/GDPR-K style minimization)? This is a compliance question, not just a workflow one, and it's currently a blank.

## 5. Revised flow (plain description)

```
Create account → email verify loop → complete profile → age band determined
                                                              |
        -----------------------------------------------------------------------------
        |                              |                                            |
     Adult (17+)                  Teen (12-16)                                 Child (0-11)
        |                              |                                            |
  PENDING_APPROVAL          PENDING_GUARDIAN_APPROVAL                 email match check
        |                    (email + link, 7d,                        /              \
        |                     reminder/escalate)                  matches           no match
        |                              |                        existing            → create profile,
        |                        guardian reviews                member            assign email as
        |                     (or Super Admin override)         PENDING_           parent id, send
        |                       /        |        \          PARENTAL_CONSENT     claim+consent email
        |                  approve    reject    no response   (guardian_link_     PENDING_PARENTAL_
        |                     |          |          |          type=EXISTING_     CONSENT
        |                     |          |      reminder →        MEMBER)        (guardian_link_
        |                     |          |      escalate to           |           type=NEW_CLAIM,
        |                     |          |      Super Admin           |            longer window)
        |                     |          |          |                 |                 |
        |               GUARDIAN_    REJECTED   (feeds back           |                 |
        |               APPROVED    (rejected_    into guardian  same guardian review as Teen
        |                     |      by=GUARDIAN)   review)     (approve / reject / no-response)
        |                     |          |
         \                    /          |
          -------------------            |
                 |                       |
           PENDING_APPROVAL         member edits, resubmits
                 |                  (dashed loop → back to age-based routing;
        admin reviews                only re-run guardian step if guardian-
        (Vibhaag/Nagar/                relevant fields changed — TBD)
        Shakha/Kendriya/
        Super Admin)
          /        \
      approve     reject
         |            |
      ACTIVE       REJECTED
                  (rejected_by=ADMIN)
                        |
                member edits, resubmits
                (dashed loop → back to age-based routing)

Post-activation lifecycle (not part of registration): ACTIVE → INACTIVE (admin
deactivation) or → DELETED (retention/erasure) — triggers currently undocumented.
```

A rendered version of this is in `Registration-Flow-v2.html` (Mermaid, same visual language as `HSS-System-Flow-Diagram.html`) alongside this file.

## 6. Open items needing a decision before this is folded into the FRD

1. Guardian link expiry cadence — reminder/escalation days for Teen vs. Child/NEW_CLAIM (§4.2).
2. Resubmission behavior — full guardian re-approval vs. conditional re-approval (§4.3).
3. Mid-flight age-band transitions — freeze at submission vs. re-evaluate (§4.4).
4. Dispute handling on guardian decline (§4.5).
5. Super Admin override confirmed for Child lane (§4.6).
6. Skip re-verification for email already verified on an existing member; profile-switcher UX for shared parent/child login (§4.7).
7. `INACTIVE` / `DELETED` triggers and Child data retention policy (§4.9).
8. Can a `DELETED` member be reactivated back to `ACTIVE`, or is deletion terminal? (§7.4)
9. Escalation-loop ceiling and admin-review timeout — see §7.1 and §7.2, both still open.

Nothing in this document has been written into `frd/05-members.md` or published to the Doc — say the word if you want any of this folded in once the open items above are resolved.

## 7. Flow liveness review — can the flow get stuck?

Walked the diagram end to end for dead ends and infinite loops, after the 1A/1B email-delivery-failure branch was added.

**7.1 Escalation loop has no ceiling.** Node 9 (Guardian reviews) → "No response by expiry" → 9C (Escalate to Super Admin queue) → loops straight back into node 9, whose only exits are Approve / Reject / no-response-again. If the Super Admin also never acts, the record cycles indefinitely with no forced resolution. **[TBD — Needs Confirmation]**

**7.2 Admin review (node 11) has no timeout at all.** Guardian review at least attempts to escalate on expiry (7.1); admin review has no "no response by expiry" branch. A registration sitting in `PENDING_APPROVAL` can sit untouched forever. **[TBD — Needs Confirmation]**

**7.3 Email verification loop (1B) — partially addressed.** The new "Email delivered?" check (between 1A and 1B) now retries the send on a bounce or technical failure, closing that specific gap. What's still open: no cap on how many times a legitimate resend can be requested, and no expiry/cleanup policy for an account that's never verified by the user (as opposed to never delivered). **[TBD — Needs Confirmation]**

**7.4 Is `DELETED` reversible?** The diagram only draws `DELETED` as reachable from `ACTIVE` (via retention/erasure). Whether a deleted member can later be reactivated back to `ACTIVE`, or whether deletion is a terminal/irreversible state, is undecided. **Kept open per your instruction — no diagram change made.**

**7.5 False email-match repeat loop (Child path).** If node 7C matches the wrong existing member and that member correctly declines ("not my child"), resubmission re-runs 7C and can re-match the same wrong person if the entered email isn't corrected during the edit. **Decision: keep current behavior as-is, no fix planned.**

**7.6 No cap on resubmission count.** 13A/13B loop back to the routing decision with no maximum `submission_count`. Not a dead end — always has a next step — but an unbounded reject/resubmit cycle is possible. **[TBD — Needs Confirmation]**
