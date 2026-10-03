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

## Documentation and Progress

- Update `todo.md` when it exists or the repository uses it to track progress and decisions.
- Update `CHANGELOG.md` when a change is user-facing or otherwise worth noting for future reference.
- Update `README.md` when the project's purpose, setup, architecture, or current state changes.
- Update `docs/` when a change affects setup, configuration, operations, or troubleshooting and the repository maintains detailed documentation there.
- Stage, commit and push changes in small, verifiable increments to github. Avoid large, unreviewable commits. Use branches for larger changes and pull requests for review when appropriate. Maintain a clear commit history with descriptive messages. Avoid "fixup" or "squash" commits unless they are part of a review process. Create the commit message and PR description to clearly describe the change, why it was made, and how it was verified.

## Skill Usage

Choose a skill when its purpose directly matches the task. Do not invoke a skill by default for unrelated work.

| Task | Required skill usage |
| --- | --- |
| Writing, reviewing, or refactoring code | Use `clean-code` and `karpathy-guidelines`. Keep changes small, readable, and verifiable. |
| Building a new UI feature or materially redesigning a page, component, or visual system | Use `frontend-design` in addition to the code-quality skills. Define a brief, product-specific visual direction before implementation; verify responsiveness, accessibility, and visual hierarchy afterward. |
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
