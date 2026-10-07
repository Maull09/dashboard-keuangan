# Finance Tracker Design System

Status: active

## Purpose

Finance Tracker helps one person record, review, and plan their money in IDR. The interface must make balances, changes, warnings, and next actions easy to scan on desktop and mobile. It should feel calm and precise, never promotional or ornamental.

## Foundations

### Colour

Use the blue-led palette below. It replaces the previous teal treatment throughout the product.

| Token | Value | Use |
| --- | --- | --- |
| Brand | `#0052FF` | Primary actions, selected navigation, data emphasis |
| Brand active | `#003ECC` | Hover and active states; linked text |
| Brand soft | `#EEF3FF` | Selected rows and low-emphasis blue surfaces |
| Brand border | `#C9D8FF` | Blue notices and selected-control borders |
| Ink | `#0A0B0D` | Headings, amounts, and primary text |
| Body | `#5B616E` | Supporting copy |
| Muted | `#7C828A` | Tertiary metadata only |
| Hairline | `#DEE1E6` | Borders and dividers |
| Canvas | `#F7F7F7` | Application background |
| Surface | `#FFFFFF` | Cards, menus, and form controls |
| Positive | `#047857` | Income and favourable changes |
| Warning | `#B45309` | Approaching limits and incomplete data |
| Negative | `#BE123C` | Losses, overdue amounts, and destructive actions |

Do not introduce teal for status, navigation, controls, or charts. Colour reinforces meaning; labels, signs, and amounts must still communicate the state without colour.

### Typography

Use the locally loaded Geist family for all interface text. It keeps screens compact and legible while matching the existing application stack.

| Role | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Page title | 30px / 36px desktop; 24px / 30px mobile | 600 | Page-level task |
| Section title | 20px / 28px | 600 | Cards and grouped information |
| Body | 14px / 22px | 400 | Descriptions and controls |
| Supporting text | 12px / 18px | 400–500 | Dates, hints, and metadata |
| Financial figure | 20–30px / 1.15 | 600 | Amounts; always use tabular numerals |

Use sentence case. Keep supporting copy short, concrete, and action-oriented. English and Indonesian must convey the same intent.

### Spacing, shape, and elevation

- Use a 4px rhythm: `4, 8, 12, 16, 24, 32, 48, 64`.
- Use 8px radius for controls and 12px radius for cards and notices.
- Use 1px `Hairline` borders to group information. Avoid decorative gradients and heavy shadows.
- Keep primary controls at least 44px high. Align labels, fields, and related actions on their control edge at desktop widths; stack them with clear gaps on narrow screens.
- Use a 150–200ms colour transition for direct interaction only. Respect reduced-motion preferences.

## Components and states

- **Primary button:** Brand background, white text, Brand active on hover.
- **Secondary button:** Surface with Hairline border; use for a related alternative.
- **Selected navigation and summary:** Brand soft background with Brand active text.
- **Forms:** Show a persistent, visible label. Place hint text below its field. Keep submission feedback near the action.
- **Cards:** Surface background, Hairline border, quiet structure. Financial figures are the visual anchor.
- **Charts:** Lead with Brand. Use Positive and Negative for income and expense or gains and losses. Use neutral blue-grey values for remaining series.

## Product behaviour and content

The dashboard is a working financial record: accounts feed balances, transactions feed budgets and reports, and planning views estimate future changes without altering recorded transactions. Feedback must state what changed, what failed, and the available next action.

Use concise copy that names the user task. Prefer “Update daily prices” over implementation details, and “Add budget” over generic verbs. Avoid defensive technical caveats in routine UI; present data date, error state, or incompleteness only where it changes a financial decision.

## Implementation rule

`src/app/globals.css` owns the semantic colour tokens. Components should use those tokens and existing shared primitives rather than scattered colour values. When a lasting visual decision changes, update this document before changing the implementation.
