# IoT-REAP — Phase Navigation Guide
> This file is your north star. Read it at the start of every sprint.
> Each phase links to its detailed file. Follow phases in order — never skip ahead.

---

## Project at a Glance

| Item | Value |
|---|---|
| **Total Sprints** | 8 × 2 weeks = 16 weeks |
| **Total Story Points** | 245 SP across 50 user stories |
| **Stack** | Laravel 11 · React 18 · TypeScript · Proxmox VE · Apache Guacamole · MQTT |
| **AI Tool** | GitHub Copilot in VSCode (governed by `COPILOT_INSTRUCTIONS.md`) |
| **Methodology** | Agile Scrum — solo developer |

---

## Phase Map

```
SPRINT 1  ──►  SPRINT 2  ──►  SPRINT 3  ──►  SPRINT 4
Foundation     Proxmox         Guacamole       Files &
& Auth         Integration     Access          Robot Base
   │               │               │               │
   ▼               ▼               ▼               ▼
[phase-1.md]  [phase-2.md]  [phase-3.md]  [phase-4.md]

                        ┌─── MVP DEMO (Week 6) ───┘

SPRINT 5  ──►  SPRINT 6  ──►  SPRINT 7  ──►  SPRINT 8
Camera &        Zero-Trust      OT, Catalog,    Testing &
AI Scheduler    & Maintenance   Compliance      Defense
   │               │               │               │
   ▼               ▼               ▼               ▼
[phase-5.md]  [phase-6.md]  [phase-7.md]  [phase-8.md]

                    └─── FEATURE COMPLETE (Week 12) ───┘
                                        └─── PFE DEFENSE (Week 16) ───┘
```

---

## How to Use These Files

### At Sprint Start (Architect Hat — 2 hours)
1. Open the phase file for the current sprint
2. Read the **Sprint Goal** and **Context** sections
3. Read the **Copilot Setup** section — configure your workspace
4. Create GitHub Issues for every task listed
5. Move all issues to your Sprint Backlog on GitHub Projects
6. Identify the **riskiest task** — schedule it for Day 1

### During Development (Developer Hat — daily)
1. Keep the phase file open in a split pane
2. Follow the **Task Checklist** in order
3. Before starting each task, read its **Copilot Prompt** block
4. Use the **Acceptance Criteria** column to know when you're done
5. Log blockers in `docs/daily-log.md`

### At Sprint End (Reviewer Hat — half day)
1. Go through the phase file **Definition of Done** checklist
2. Write your Sprint Review in `docs/sprint-reviews/sprint-N.md`
3. Write 3-line Retrospective
4. Tag `develop`: `git tag sprint-N-complete`
5. Open the next phase file

---

## Layer Reference Files

For deep rules on each technical layer, see:

| File | When to Read |
|---|---|
| `layers/BACKEND.md` | Before writing any Laravel code |
| `layers/FRONTEND.md` | Before writing any React/TypeScript code |
| `layers/INFRA.md` | Before touching Docker, CI/CD, Proxmox config |
| `layers/SECURITY.md` | Before any auth, token, or access control work |
| `layers/TESTING.md` | Before writing any test |
| `layers/API_CONTRACTS.md` | Before building any endpoint or consuming one |

---

## Sprint Progress Tracker

Update this table as you complete each sprint.

| Sprint | Focus | Status | Velocity | Notes |
|---|---|---|---|---|
| Sprint 1 | Foundation & Auth | ⬜ Not Started | — | — |
| Sprint 2 | Proxmox Integration | ⬜ Not Started | — | — |
| Sprint 3 | Guacamole Access | ⬜ Not Started | — | — |
| Sprint 4 | Files & Robot Base | ⬜ Not Started | — | — |
| Sprint 5 | Camera & AI Scheduler | ⬜ Not Started | — | — |
| Sprint 6 | Zero-Trust & Maintenance | ⬜ Not Started | — | — |
| Sprint 7 | OT, Catalog, Compliance | ⬜ Not Started | — | — |
| Sprint 8 | Testing & Defense | ⬜ Not Started | — | — |

> Update status: ⬜ Not Started → 🔄 In Progress → ✅ Complete → ⚠️ Blocked

---

## Global Constraints (Never Change These)

```
PHP version:        8.3+
Laravel version:    11.x
Node version:       20 LTS
React version:      18.x
TypeScript:         5.x strict mode
MySQL:         15.x
Redis:              7.x
Proxmox VE:         8.x
Guacamole:          1.5.x
```

---

## Escalation Rules

| Situation | Action |
|---|---|
| Stuck > 15 minutes | Stop. Ask Claude with full code context. |
| Copilot suggests code violating `COPILOT_INSTRUCTIONS.md` | Reject. Write a corrective comment. Regenerate. |
| CI is red | Fix before writing any new feature code. No exceptions. |
| A task bleeds into a second sprint | Finish core behavior. Defer polish. Create new issue. |
| External API (Proxmox/Guacamole) behaves unexpectedly | Check API files first. Then check Proxmox/Guacamole docs. Then ask Claude. |
