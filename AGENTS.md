# Repository Instructions

## General Working Principles

- Prefer simple, explicit solutions over clever abstractions.
- Change only what is needed for the request; do not refactor unrelated code.
- Follow the repository's existing naming, formatting, and directory conventions.
- Write readable, maintainable code. Optimize only when there is a demonstrated need.
- Do not add fallbacks, backward compatibility, configuration, or abstractions unless the request requires them.
- State important assumptions when they affect implementation or behavior. Ask before making a choice that materially changes scope.
- Keep secrets and local environment values out of source control.

## Implementation and Verification

- Understand the affected behavior before editing.
- Keep functions and modules focused on one clear responsibility.
- Prefer descriptive names and straightforward control flow over explanatory comments.
- Preserve existing public behavior unless the request explicitly changes it.
- Run the smallest relevant check, test, type check, lint command, or build after a change when available.
- Report what changed and which verification was actually run.

## Documentation

- Update only the source-of-truth document made inaccurate by the change. Do not update `README.md`, `CHANGELOG.md`, `todo.md`, or unrelated files in `docs/` merely because they exist.
- Update `README.md` only for material purpose, setup, architecture, or current-state changes. Update a focused document in `docs/` only for lasting setup, configuration, operations, or troubleshooting guidance.
- Update `CHANGELOG.md` only for user-facing, release-worthy changes. Update `todo.md` only for meaningful progress, decisions, or newly discovered follow-up work.
- Preserve historical entries and unrelated documentation. Do not rewrite, duplicate, or overwrite existing guidance unless the request specifically requires it.

## Design System

- Read `DESIGN.md` before designing, implementing, reviewing, or refactoring any user-facing interface.
- Treat `DESIGN.md` as the source of truth for Finance Tracker's visual tokens, typography, layout rhythm, component states, and product voice. Keep UI code aligned with it.
- Update `DESIGN.md` before implementation when a lasting visual direction, token, or component rule changes. User requests and the financial-clarity requirements in this file take precedence if they conflict.

## Git Workflow

### Start

- Start Git work by fetching the remote and identifying the current default branch. Update the local default branch with a fast-forward-only pull before creating a dedicated, descriptively named branch from it. Do not start feature work from a stale branch, an unrelated open PR, or a branch with uncommitted changes.

### Validate

- Before staging, confirm that the requested change belongs to the current branch and its intended PR. Check for an existing PR or already-merged equivalent change before opening another one. Do not add unrelated documentation, chores, or fixes to a feature branch unless the user explicitly asks to combine them.
- Before committing, run every available applicable local gate: any configured pre-commit hook, lint, focused tests (or the full test suite when appropriate), TypeScript checking, and a production build for application changes. Run a relevant security check such as `npm audit --omit=dev` when dependencies, server code, secrets, authentication, input handling, or financial-data handling are affected. Report unresolved findings; never run automatic security fixes without approval.

### Submit

- Stage only the requested files after reviewing both the working diff and staged diff. Make small, descriptive commits that each pass their relevant checks. Push the branch, create or update one focused PR targeting the current default branch, and state what changed, why, and the checks that actually passed. Avoid "fixup" or "squash" commits unless they are part of a review process.

## Skill Usage

Choose a skill when its purpose directly matches the task. Do not invoke a skill by default for unrelated work.

| Task | Required skill usage |
| --- | --- |
| Writing, reviewing, or refactoring code | Use `clean-code` and `karpathy-guidelines`. Keep changes small, readable, and verifiable. |
| Implementing or reviewing backend code, API routes, database access, authentication, or server-side business logic | Also use `backend-patterns` alongside the applicable code-quality skills. Preserve explicit validation, authorization, error handling, and database boundaries. |
| Reviewing changes for security issues or working on authentication, authorization, input handling, secrets, payments, or financial data | Also use `security-review` before completing the work. Treat its findings as recommendations subject to this repository's financial-data safety requirements. |
| Designing, implementing, reviewing, or refactoring a user-facing interface | Use `design-principle` and `ui-ux-pro-max` in addition to the applicable code-quality skills. Establish the user, goal, activity, context, conceptual model, feedback, and usability target; record material UI assumptions rather than treating them as facts. Query `ui-ux-pro-max` narrowly: use a design-system search for a new page or system, or an explicit domain/stack search for a focused concern. Treat its results as recommendations; Finance Tracker clarity, financial safety, localization, and existing repository rules take priority. |
| Building a new UI feature or materially redesigning a page, component, or visual system | Use `frontend-design` and `design-principle` in addition to the code-quality skills. Define a brief, product-specific visual direction before implementation; verify responsiveness, accessibility, task completion, and visual hierarchy afterward. |
| Landing page, portfolio, or marketing-focused redesign | Also use `design-taste-frontend` (Taste Skill) when it fits the brief. Do not use it for this product's financial dashboard, data tables, forms, multi-step workflows, or other dense product UI; retain the Finance Tracker's clarity-first design priorities. |
| Small visual correction with no design decision | Use the code-quality skills; `frontend-design` is optional. |

Read the selected skill's instructions before acting. If skills conflict, follow the user's request and the repository's requirements first.

## Repository-Specific Context

This section is intentionally project-specific. Replace or remove it when copying this file to another repository.

### Finance Tracker

- This repository is a personal finance dashboard for recording accounts, transactions, budgets, financial goals, and debts or receivables.
- The application uses Next.js, React, TypeScript, Tailwind CSS, Drizzle ORM, and PostgreSQL through Supabase.
- UI copy supports English and Indonesian. Keep both translations in sync and preserve IDR currency formatting.
- Database schema definitions live in `src/db/schema.ts`; API route handlers live in `src/app/api/`; reusable UI components live in `src/components/`.
- Treat financial amounts and transaction history as user data: validate inputs, avoid unintended data changes, and keep API behavior explicit.
- Favor financial clarity over decoration: amounts, trends, warnings, and primary actions must remain easy to scan on desktop and mobile.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
