# Child Registration — Developer Logic Flow

Scope: age band **Child (0–12)** only. Grounded in `MyHSS Reference Data - Registration Flow.pdf` + prior brainstorm decisions (statuses, flags, guardian consent model).

## 0. Two entry points (this is the key thing the PDF adds)

The PDF's "Recommendation" section means Child registration is **not** one single path — it's two, and the branching logic differs:

1. **Add Child** — a *logged-in, registered* member adds a child from **My Profile**. Parent is already authenticated, so `parent_id` is known directly. No email-match guesswork, no consent email needed (the actor *is* the guardian).
2. **General "New Registration" form** — used when there's no logged-in parent account yet. This is where email-match detection and the consent/claim flow apply.

Routing everything through path 2 (as the original diagram did) is what causes the bug the PDF flags: a registered member entering their own email on the public form collides with the adult-account duplicate-email check. Hence the "Add Child" UI entry point.

## 1. Full pseudocode

```
Member registration
If (member age 0-12)   // Child — see age-band vs age-category note below
{
    If (entry point == "Add Child" AND actor is logged-in registered member)
    {
        * Member will add child from my profile.
	* parent_id = actor's own member_id (no lookup needed)
        * Create child record -> new member_id, status = REGISTERED
        * No separate login/password for child (per requirement: "without a separate login")
        * Guardian consent is implicit -> GUARDIAN_APPROVED = true immediately
        * status -> PENDING_APPROVAL (flags: email_verified=true [inherited], GUARDIAN_APPROVED)
        -> go to Admin Approval
    }
    Else   // general public registration form, no logged-in parent
    {
        If (Member email == existing member's email)
        {
            * parent_id = matched existing member_id
            * Create child record -> new member_id, status = REGISTERED
            * status -> PENDING_PARENTAL_CONSENT
              (flags: email_verified=true, guardian_link_type=EXISTING_MEMBER,
               consent_link_sent_at=now, consent_link_expires_at=+7d)
            * Send consent confirmation email to that address
              (confirms THIS specific child claim — not a login)
            On guardian approve -> GUARDIAN_APPROVED=true -> status = PENDING_APPROVAL
            On guardian reject  -> status = REJECTED (rejected_by=GUARDIAN, reason required)
            On no response by expiry -> escalated_to_super_admin=true, re-queue for review
        }

        If (Member email !== existing member's email)
        {
            * parent_id = NULL (blank) — intentional, not a placeholder value.
              Left blank so it can be auto-fulfilled later if the member/parent
              self-registers (see "Future" block below).
            * Create child record -> new member_id, status = REGISTERED
            * Attach entered email as the child record's own login-enabling email
              (per requirement: non-registered "parent" gets a login via this email
               to manage the child profile)
            * status -> PENDING_PARENTAL_CONSENT
              (flags: guardian_link_type=NEW_CLAIM, guardian_email_claimed=false,
               consent_link_sent_at=now, consent_link_expires_at=+14d)
            * Send claim+consent email
              (must both prove mailbox ownership AND capture consent)
            On claim + approve -> guardian_email_claimed=true, GUARDIAN_APPROVED=true
                                -> status = PENDING_APPROVAL
            On decline -> status = REJECTED (rejected_by=GUARDIAN, reason required)
            On no response by expiry (14d) -> escalated_to_super_admin=true, re-queue
        }
    }

    // Same email, multiple children
    If (this email already has 1+ prior child record(s) attached)
    {
        * New child auto-links to the SAME parent_id already resolved for that email
        * Do NOT re-send a claim/consent email if guardian_email_claimed is already
          true for that email — reuse the existing claimed relationship
    }

    // Fulfillment of the blank parent_id above — confirmed, not optional.
    // This is what "blank" is FOR: it gets filled the moment the real member/parent
    // registers under that same email.
    If (a member/parent later self-registers (as an adult, or matches via existing
        member flow) using an email that has NEW_CLAIM child records with parent_id
        still blank)
    {
        * Fill in those child records' parent_id = the newly resolved member_id
        * Reconcile guardian_link_type from NEW_CLAIM -> EXISTING_MEMBER
    }
}

// Admin Approval (shared endpoint for Adult / Teen / Child once status = PENDING_APPROVAL)
On admin review:
    Approve -> status = ACTIVE
    Reject  -> status = REJECTED (rejected_by=ADMIN, reason required) -> member edits & resubmits
```

## 2. Separate rule, not child logic but adjacent

The general "New Registration" form must still reject an **adult self-registration** if the entered email already belongs to an existing member (duplicate-email validation — this is what the "Add Child" entry point is designed to route around).

## 3. Decisions confirmed / still open

- ~~**`parent_id` f Intentional — it's left blank precisely so it can be auto-fulfilled later when the member/parent self-registers under that same email (see the fulfillment block in the pseudocode). The PDF's "marked 1" note is superseded by this decision.
- Whether "Add Child" by a registered member still needs *any* lightweight self-confirmation step, or truly zero friction straight to PENDING_APPROVAL as written above.

## 4. Not covered here

Adult and Teen logic flows aren't included — this was scoped to Child only. Happy to produce those in the same format if useful.
