# IoT-REAP Design Palette

> Extracted from the app's CSS design system (`resources/css/app.css`, `tailwind.config.ts`)
> Use this palette to style the presentation consistently with the application.

---

## Brand Colors

| Token | OKLCH Value | Hex (approx) | Usage |
|---|---|---|---|
| **Primary** (Teal) | `oklch(63.861% 0.11491 179.792)` | `#2A9D8F` | CTAs, active states, brand identity, focus rings |
| **Secondary** (Navy) | `oklch(18.345% 0.09471 280.992)` | `#1A1B3A` | VM Labs badge, secondary actions, dark accents |
| **Accent** (Teal) | `oklch(0.56 0.11 180)` | `#2A9D8F` | Focus rings, interactive highlights |

## Semantic Colors

| Token | OKLCH Value | Hex (approx) | Usage |
|---|---|---|---|
| **Success** (Green) | `oklch(0.62 0.18 145)` | `#34A853` | Active sessions, completion, confirmed status |
| **Warning** (Amber) | `oklch(0.75 0.18 60)` | `#E8A838` | Pending actions, caution states |
| **Info** (Blue) | `oklch(0.65 0.18 250)` | `#3B82F6` | Informational badges, links |
| **Destructive** (Red) | `oklch(0.577 0.245 27.325)` | `#DC2626` | Error states, terminate actions, alerts |

## Surface & Background Colors

| Token | Light Mode | Dark Mode |
|---|---|---|
| **Background** | `hsl(40, 30%, 97%)` — warm off-white | `oklch(0.145 0 0)` — near black |
| **Foreground** | `oklch(0.145 0 0)` — near black | `oklch(0.985 0 0)` — near white |
| **Card** | `oklch(1 0 0)` — pure white | `oklch(0.145 0 0)` — near black |
| **Border** | `oklch(0.922 0 0)` — light gray | `oklch(0.269 0 0)` — dark gray |
| **Muted** | `oklch(0.97 0 0)` — subtle gray | `oklch(0.269 0 0)` — muted dark |

## Chart Palette (5 colors)

| Chart Color | OKLCH Value | Hex (approx) |
|---|---|---|
| **Chart 1** (Orange) | `oklch(0.646 0.222 41.116)` | `#E8723A` |
| **Chart 2** (Teal) | `oklch(0.6 0.118 184.704)` | `#2AA198` |
| **Chart 3** (Dark Blue) | `oklch(0.398 0.07 227.392)` | `#2E4A7A` |
| **Chart 4** (Yellow-Green) | `oklch(0.828 0.189 84.429)` | `#C5D34A` |
| **Chart 5** (Warm Orange) | `oklch(0.769 0.188 70.08)` | `#D4943A` |

## Typography

| Role | Font Family | Weights | Usage |
|---|---|---|---|
| **Primary Sans** | Instrument Sans | 400, 500, 600 | Body text, navigation, UI elements |
| **Headings** | Space Grotesk | 400, 500, 600, 700 | All h1–h6 headings, slide titles |
| **Body** | DM Sans | 400, 500, 600, 700 | Learning content, paragraph text |
| **Monospace** | Monaco / Cascadia Code | — | Terminal/console screens |

### Recommended Presentation Typography
- **Slide titles**: Space Grotesk Bold (700)
- **Slide subtitles**: Space Grotesk Medium (500)
- **Body text**: DM Sans Regular (400) or Instrument Sans Regular (400)
- **Code/technical**: Monaco or Cascadia Code

## Border Radius

| Token | Value |
|---|---|
| Base radius | `0.625rem` (10px) |
| Large | `var(--radius)` — 10px |
| Medium | `calc(var(--radius) - 2px)` — 8px |
| Small | `calc(var(--radius) - 4px)` — 6px |

## Shadows

| Token | Value | Usage |
|---|---|---|
| **Card** | `0 1px 3px hsl(220 70% 15% / 0.06)` | Subtle elevation for cards |
| **Card Hover** | `0 4px 12px hsl(220 70% 15% / 0.08)` | Hover state for cards |
| **Glow** | `0 0 30px hsl(175 60% 42% / 0.15)` | Teal glow for featured elements |

## Hero Gradient

```
linear-gradient(135deg, hsl(220 70% 15%) 0%, hsl(220 60% 25%) 50%, var(--primary) 100%)
```

Dark navy → mid-blue → teal. Use for title slides and hero sections.

## Sidebar Colors (Admin Panel)

| Token | Light | Dark |
|---|---|---|
| Sidebar BG | `oklch(0.985 0 0)` | `oklch(0.145 0 0)` |
| Sidebar Accent | `oklch(72.232% 0.12828 179.836 / 0.308)` | `oklch(0.269 0 0 / 0.4)` |
| Sidebar Primary | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |

## Badge / Level Colors

| Level | Color | Hex |
|---|---|---|
| Beginner | Emerald | `#10B981` |
| Intermediate | Amber | `#F59E0B` |
| Advanced | Rose | `#F43F5E` |

## Design Patterns to Replicate in Slides

1. **Warm off-white background** (`hsl(40, 30%, 97%)`) — never pure white for slide backgrounds
2. **Teal as primary brand** — use for headings, CTAs, highlights
3. **Dark navy for contrast** — use for footer bars, accent strips
4. **Card-based layout** — use subtle shadows (`--shadow-card`) for content blocks
5. **Glassmorphism header** — semi-transparent with backdrop blur for nav bars
6. **Category gradients** on cards — use the chart palette for section dividers
7. **Consistent icon pairing** — Lucide icon style (simple, outlined, 4–5px stroke)
8. **10px border radius** on all containers and cards
9. **Focus ring style** — `2px solid teal` around interactive elements
10. **135deg gradient direction** for hero/title slides

## Quick Copy — CSS Variables for Presentation

```css
:root {
  --primary: #2A9D8F;
  --secondary: #1A1B3A;
  --success: #34A853;
  --warning: #E8A838;
  --info: #3B82F6;
  --destructive: #DC2626;
  --bg: hsl(40, 30%, 97%);
  --fg: #1A1A1A;
  --card: #FFFFFF;
  --border: #EBEBEB;
  --radius: 10px;
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```
