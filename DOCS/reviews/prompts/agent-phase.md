You are in AGENT MODE executing a finalized implementation spec.

This is an execution-only task on a large system.

Authoritative context (must be read and obeyed in this order):

1. Repository Copilot instructions (.md files in context)
2. Execution index: docs/reviews/EXECUTION_INDEX.md
3. Canonical specs: docs/reviews/spec/

Target:

- Phase {PHASE_NUMBER}

Rules:

- Do NOT redesign architecture
- Do NOT add features
- Do NOT optimize beyond what is specified
- Do NOT introduce alternatives or improvements
- Do NOT cross phase boundaries
- Treat completed phases as immutable
- If anything is ambiguous or missing, STOP and ask before proceeding

Execution constraints:

- Implement ONLY Phase {PHASE_NUMBER}
- Use ONLY the spec sections referenced by the execution index
- Do not rely on memory or previous conversations
- Respect all repository-level Copilot instructions

---

## Step 1: Create an execution TODO list

Before implementing anything:

- Derive a concrete, ordered TODO list for Phase {PHASE_NUMBER}
- Each TODO item must map to a task in the execution index
- Mark which items are:
  - code
  - WordPress Admin
  - frontend
  - configuration
- Identify dependencies between TODOs
- Identify any blocking unknowns

Output the TODO list and STOP.

Do NOT implement yet.

---

## Step 2: Execute the TODO list

After TODOs are approved:

- Implement TODOs in order
- Complete one logical group at a time
- Do not skip or merge TODO items
- If a TODO cannot be completed, STOP and report why

---

## Output requirements

- Do not restate the spec
- Keep output bounded to the current TODO group
- After execution, report:
  - Completed TODOs
  - Incomplete TODOs
  - Assumptions made
  - Open questions or blockers

Stop immediately after Phase {PHASE_NUMBER} is completed.
