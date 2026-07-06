---
description: Wake qa-agent to write or update Playwright test cases for one FRD module.
argument-hint: [module (optional)] [google-doc-url-or-tab-link (optional)]
---

The user ran `/qa-write-tests $ARGUMENTS`.

Step 1 (ALWAYS DO THIS FIRST — no exceptions): Ask the user to confirm which
module this run is for. Do this every single time, even if `$ARGUMENTS`
already appears to name a module — confirm it explicitly before proceeding.
Do not skip this because a module name was typed after the command.

Step 2: Once the module is confirmed, resolve the Google Doc URL/tab link
for that module's FRD section. If `$ARGUMENTS` included one, confirm it's
still the right one; if not given, ask for it — never guess or reuse a URL
from an earlier conversation.

Step 3: Invoke the `qa-agent` subagent via the Task tool, passing along:
- the confirmed module name
- the confirmed Google Doc URL
- an explicit instruction that this may be a re-run: qa-agent must check
  `QA/QA/test-cases/test-case-master.xlsx` and `QA/frd-snapshots/` for this
  module first. If a prior snapshot exists, it must diff the freshly fetched
  Doc content against it (per qa-agent.md Step 6.5) and only add/update
  Test-IDs and specs for acceptance criteria that are new or changed —
  leaving unchanged criteria's rows and specs untouched. If no prior
  snapshot exists, it's a first run and should generate fresh.

Do not do any of qa-agent's work yourself (don't fetch the Doc, don't write
to `test-cases/test-case-master.xlsx` or any spec file) — this command exists
only to hand off to `qa-agent` with the right, confirmed inputs. Return
whatever qa-agent reports back to the user as-is, including its new/updated/
unchanged breakdown.
