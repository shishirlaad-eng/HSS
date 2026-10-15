# UI Feedback Inbox

Raw client feedback lands here first. When you trigger an FRD update, the FRD-Author
agent reads this file, classifies each item, folds the **functional** parts into the
correct module file, and marks the rest.

## How to use

Paste raw feedback under "Unprocessed". Don't pre-sort it — that's the agent's job
(with your confirmation). After an update run, items move to "Processed" with their
classification and the module file they affected.

## Classification key

- **UI-only** — visual/cosmetic, no backend impact. Stays here, not folded into FRD.
- **Functional** — changes how the system behaves. Folded into the matching module file.
- **Business-logic** — changes a rule, validation, or state transition. Folded in + flagged.
- **Navigation** — changes screen flow / entry-exit points. Folded into Section 5 of the affected screen.
- **Mixed** — looks like UI but hides a functional change (e.g. "move consent checkbox to screen 2"
  changes *when* consent is captured). Split: UI part stays, functional part folded in.

---

## Unprocessed

*(paste new client feedback below this line)*



---

## Processed

| Date | Raw feedback (short) | Classification | Action taken | Module file |
|------|----------------------|----------------|--------------|-------------|
| 2026-10-15 | Guru Puja Report: Age categories show total dakshina; add date search; change Attendance to Sankhya (present count only); replace Income with Dakshina; record locked when completed (Super Admin unlock only) | Business-logic / Functional | Added Guru Puja Report section in frd/08-reports.md, updated GuruPujaReport.tsx with date filter, dakshina totals, sankhya column, complete advisory text, and Super Admin unlock governance | 08-reports.md |
