---
name: campkit-active-scope
description: Use when working on the current CampKit checklist web-app flow to keep context small. Focus on backend/Index.html and backend/Code.gs first. Read docs markdown only when needed, and avoid docs HTML previews unless the user explicitly restores them.
---

# CampKit Active Scope

Use this skill for the current CampKit packing-checklist workstream.

## Default scope

Read these files first and prefer stopping there unless the task clearly requires more:

- `backend/Index.html`
- `backend/Code.gs`

Read `backend/Config.gs` only if the task touches sheet names, columns, or deployment configuration.

Read `docs/*.md` only when the task needs schema, API, or checklist rules.

Do not read `frontend/` or docs HTML preview files unless the user explicitly asks for them.

## Current project focus

Treat this as the active sequence:

1. Build approved checklist UX directly in `backend/Index.html`
2. Add `update_item` and `delete_item` in `backend/Code.gs`
3. Keep UI and backend behavior aligned without maintaining parallel preview HTML

If the user asks for help outside this sequence, confirm by checking whether the task still belongs to the checklist web flow before expanding scope.

## Backend-first rule

Use `backend/Index.html` as the source of truth for both style and intent.

- Match backend information hierarchy, component behavior, modal tone, and checklist mental model before adding new ideas.
- Do not create or maintain a parallel docs HTML prototype unless the user explicitly asks for one.
- Prefer implementing and iterating in backend directly.

## Token-saving workflow

- Start with file-level diff/status, not full repo reads.
- Prefer targeted search over broad scans.
- Summarize progress from the active backend files before opening anything else.
- Keep mental model centered on Apps Script checklist UI, not the older MVP architecture.
- If you need docs, prefer the smallest relevant file in `docs/`.

## Safe assumptions

- `backend/Index.html` is the production-bound UI target.
- `backend/Code.gs` is the only backend file needed for checklist item CRUD in this phase.
- Docs HTML previews are disposable unless the user explicitly asks to bring them back.
