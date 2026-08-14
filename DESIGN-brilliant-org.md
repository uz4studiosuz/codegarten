# Design System Inspired by Settings

> Auto-extracted from `https://brilliant.org/settings/account/` on 2026-08-14

## 1. Visual Theme & Atmosphere

High-contrast dark mode with vivid accents — feels modern, technical, and focused.

The hero section leads with "Personal info".

**Key Characteristics:**
- CoFo Brilliant as the heading font (custom web font loaded via @font-face)
- CoFo Brilliant as the body font for all running text
- Dark background (#141414) as the primary canvas
- Primary accent `#213c9e` used for CTAs and brand highlights
- 5 shadow level(s) detected — tinted shadows
- Rounded corners (2px+) creating a friendly, approachable feel
- Tags: dark, rounded, colorful, compact, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#213c9e`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#456dff`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#141414`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#213c9e`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#ffffff`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#364153`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#1e1e1e`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#1e1e1e` | `--palette-1` | block | medium | text-light |
| 2 | `#213c9e` | `--palette-2` | block | medium | text-light |
| 3 | `#141414` | `--palette-3` | block | medium | text-light |
| 4 | `#ffffff` | `--palette-4` | button | medium | text-dark |
| 5 | `#f2f2f2` | `--palette-5` | block | medium | text-dark |
| 6 | `#270b0b` | `--palette-6` | block | medium | text-light |
| 7 | `#080f28` | `--palette-7` | badge | small | text-light |
| 8 | `#001f09` | `--palette-8` | badge | small | text-light |
| 9 | `#456dff` | `--palette-9` | text-accent | small | text-light |
| 10 | `#364153` | `--palette-10` | text-accent | small | text-light |
| 11 | `#c43939` | `--palette-11` | text-accent | small | text-light |
| 12 | `#5ed981` | `--palette-12` | text-accent | small | text-dark |
| 13 | `#7491ff` | `--palette-13` | text-accent | small | text-dark |

## 3. Typography Rules

- **Heading Font:** `CoFo Brilliant` (web font)
- **Body Font:** `CoFo Brilliant` (web font)

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H2 | CoFo Brilliant | 24px | 700 | 30px | normal |
| H3 | CoFo Brilliant | 16px | 700 | 20.8px | normal |
| H4 | CoFo Brilliant | 16px | 400 | 24px | normal |
| Body | CoFo Brilliant | 16px | 400 | 24px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `24px` | headings |
| H1 | `20px` | headings |
| H2 | `16px` | headings |
| H3 | `14.4px` | headings |
| H4 | `14px` | headings |
| Body L | `13.6px` | body / supporting text |
| Body | `12.992px` | body / supporting text |
| Small | `12.8px` | body / supporting text |
| XS | `12px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: #1e1e1e;
  color: #ffffff;
  border-radius: 0px;
  padding: 0px 32px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #ffffff;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Pill Button

```css
.btn-pill {
  background: transparent;
  color: #ffffff;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid rgba(0, 0, 0, 0);
  cursor: pointer;
}
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: #ffffff;
  border-radius: 54px;
  padding: 9px 20px;
  font-size: 16px;
  font-weight: 500;
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}
```

### Ghost Button 2

```css
.btn-ghost-2 {
  background: transparent;
  color: #ffffff;
  border-radius: 8px;
  padding: 12px 12px;
  font-size: 16px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #141414;
  color: #ffffff;
  border-radius: 12px;
  padding: 16px 16px;
  font-size: 16px;
  font-weight: 400;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `12px` — use multiples (24px, 36px, 48px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `12px` | element |
| spacing-2 | `8px` | element |
| spacing-3 | `11.2px` | element |
| spacing-4 | `16px` | element |
| spacing-5 | `4px` | element |
| spacing-6 | `32px` | card |
| spacing-7 | `1px` | element |
| spacing-8 | `5px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-subtle | `2px` | subtle |
| radius-card | `54px` | card |
| radius-subtle | `1px` | subtle |
| radius-button | `8px` | button |
| radius-button | `12px` | button |
| radius-card | `20px` | card |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| High | `rgba(0, 0, 0, 0.1) 0px 0px 15px 0px` | Modals, floating elements |
| Deep | `rgba(0, 0, 0, 0.2) 0px 0px 25px 0px` | Hero sections, deep layers |
| Low | `rgb(199, 197, 199) -3px -3px 5px -2px` | Cards, subtle elevation |
| Mid | `rgb(199, 197, 199) 0px 0px 12px 2px` | Dropdowns, popovers |
| Low | `rgba(0, 0, 0, 0.1) 0px 4px 0px 0px` | Cards, subtle elevation |


## 7. Do's and Don'ts

### Do
- Use `#141414` as the primary background color
- Use `CoFo Brilliant` for all headings and `CoFo Brilliant` for body text
- Use `#213c9e` as the single dominant accent/CTA color
- Maintain `12px` as the base spacing unit — all gaps should be multiples
- Keep the overall feel dark — use dark surfaces throughout
- Use rounded corners (`2px`+) consistently for all interactive elements
- Embrace bold color combinations — playful energy is the point
- Apply the shadow system for elevation — use the extracted shadow values

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute CoFo Brilliant/CoFo Brilliant with generic alternatives
- Don't use irregular spacing — stick to 12px grid
- Don't introduce bright white surfaces — they break the dark palette
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#ffffff` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 12px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #141414
Text:        #ffffff
Accent:      #213c9e
Secondary:   #456dff
Border:      #1e1e1e
```

### Example Prompts

1. "Build a hero section with a `#141414` background, `CoFo Brilliant` heading in `#ffffff`, and a `#213c9e` CTA button with 0px radius."
2. "Create a pricing card using background `#213c9e`, border `#1e1e1e`, `CoFo Brilliant` for text, and 36px padding."
3. "Design a navigation bar — `#141414` background, `#ffffff` links, `#213c9e` for active state."
4. "Build a feature grid with 3 columns, 36px gap, each card using the card component style."
5. "Create a footer with `#213c9e` background, `#ffffff` text, and 24px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 156 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--shake-sdk-overlay` | `rgba(0, 0, 0, .5)` |
| `--shake-sdk-floating-button-border-color` | `linear-gradient(91.04deg, #4FCF70 2.28%, #FAD648 26.49%, #A767E5 50.69%, #12BCFE 74.9%, #44CE7B 99.11%)` |
| `--shake-sdk-pureWhite` | `#ffffff` |
| `--shake-sdk-white` | `#f2f2f7` |
| `--shake-sdk-purple` | `#6552ff` |
| `--shake-sdk-purpleDark` | `#342892` |
| `--shake-sdk-red` | `#eb5757` |
| `--shake-sdk-pureBlack` | `#000000` |
| `--shake-sdk-black` | `#1c1c1e` |
| `--shake-sdk-rainbow` | `#64b1fd` |
| `--shake-sdk-grey100` | `#2c2c2e` |
| `--shake-sdk-grey90` | `#3a3a3c` |
| `--shake-sdk-grey80` | `#48484a` |
| `--shake-sdk-grey70` | `#636366` |
| `--shake-sdk-grey60` | `#8e8e93` |
| `--shake-sdk-grey50` | `#aeaeb2` |
| `--shake-sdk-grey40` | `#c7c7cc` |
| `--shake-sdk-grey30` | `#d1d1d6` |
| `--shake-sdk-grey20` | `#e5e5ea` |
| `--shake-sdk-grey10` | `#f2f2f7` |
| `--shake-sdk-transparent` | `#00000000` |
| `--swiper-theme-color` | `#007aff` |

### Spacing Variables

| Variable | Value |
|---|---|
| `--shake-sdk-border-radius-small` | `10px` |
| `--shake-sdk-border-radius-medium` | `20px` |
| `--shake-sdk-border-radius-large` | `24px` |
| `--shake-sdk-floating-button-border-radius` | `40px` |
| `--shake-sdk-floating-button-border-size` | `2px` |
| `--shake-sdk-floating-button-content-padding-vertical` | `9px` |
| `--shake-sdk-floating-button-content-padding-horizontal` | `16px` |
| `--swiper-navigation-size` | `44px` |

### Typography Variables

| Variable | Value |
|---|---|
| `--global-font-body` | `"CoFo Brilliant", sans-serif` |
| `--shake-sdk-font-family` | `"Roobert",serif` |
| `--shake-sdk-text-color-primary-title` | `var(--shake-sdk-grey90)` |
| `--shake-sdk-text-color-primary-subtitle` | `var(--shake-sdk-grey60)` |
| `--shake-sdk-text-color-secondary-title` | `var(--shake-sdk-grey30)` |
| `--shake-sdk-text-color-secondary-subtitle` | `var(--shake-sdk-grey40)` |
| `--shake-sdk-button-accent-text-color` | `var(--shake-sdk-white)` |
| `--shake-sdk-button-text-color` | `var(--shake-sdk-grey30)` |
| `--shake-sdk-context-menu-backgroud` | `var(--shake-sdk-highlight-color-secondary)` |
| `--shake-sdk-context-menu-text-color` | `var(--shake-sdk-text-color-secondary-title)` |
| `--shake-sdk-context-menu-border` | `none` |
| `--shake-sdk-context-menu-border-radius` | `var(--shake-sdk-border-radius-small)` |
| `--shake-sdk-context-menu-hover-color` | `var(--shake-sdk-outline-color-secondary)` |
| `--shake-sdk-context-menu-icon-color` | `var(--shake-sdk-icon-color-secondary)` |
| `--shake-sdk-sheet-text-color` | `var(--shake-sdk-text-color-primary-title)` |
| `--shake-sdk-tooltip-text-color` | `var(--shake-sdk-text-color-primary-title)` |
| `--shake-sdk-tooltip-text-color-dark` | `var(--shake-sdk-text-color-secondary-title)` |
| `--shake-sdk-toolbar-text-color` | `var(--shake-sdk-text-color-primary-title)` |
| `--shake-sdk-heading-text-color` | `var(--shake-sdk-text-color-primary-title)` |
| `--shake-sdk-subtitle-text-color` | `var(--shake-sdk-text-color-primary-subtitle)` |
| ... | *(17 more)* |

### Other Variables

| Variable | Value |
|---|---|
| `--safe-area-inset-top` | `env(safe-area-inset-top,0px)` |
| `--safe-area-inset-right` | `env(safe-area-inset-right,0px)` |
| `--safe-area-inset-bottom` | `env(safe-area-inset-bottom,0px)` |
| `--safe-area-inset-left` | `env(safe-area-inset-left,0px)` |
| `--shake-sdk-color-accent` | `var(--shake-sdk-purple)` |
| `--shake-sdk-background-color-primary` | `var(--shake-sdk-pureWhite)` |
| `--shake-sdk-highlight-color-primary` | `var(--shake-sdk-grey10)` |
| `--shake-sdk-outline-color-primary` | `var(--shake-sdk-grey20)` |
| `--shake-sdk-icon-color-primary` | `var(--shake-sdk-grey100)` |
| `--shake-sdk-scrollbar-color-primary` | `var(--shake-sdk-grey20)` |
| `--shake-sdk-background-color-secondary` | `var(--shake-sdk-black)` |
| `--shake-sdk-highlight-color-secondary` | `var(--shake-sdk-grey100)` |
| `--shake-sdk-outline-color-secondary` | `var(--shake-sdk-grey90)` |
| `--shake-sdk-icon-color-secondary` | `var(--shake-sdk-grey50)` |
| `--shake-sdk-scrollbar-color-secondary` | `var(--shake-sdk-grey100)` |
| ... | *(74 more)* |
