# Design system

SatyajitOS copies macOS 26 and iOS 26 as closely as a browser allows. Everything visual comes from one token system in [`src/design`](src/design). If a colour, size, radius, shadow or easing isn't a token, it doesn't belong in a component.

```
src/design/
├── tokens.css     # raw tokens: Apple system colours, semantics, materials, metrics
├── theme.css      # Tailwind v4 @theme: maps tokens to utilities, wipes the defaults
├── materials.css  # vibrancy recipes as utilities (material-menu, material-dock…)
├── base.css       # resets, focus ring, scrollbars, reduced-motion
├── motion.ts      # spring presets for motion-v
└── index.css      # entry, imported once by main.ts
```

## Three layers of colour

| Layer | Lives in | Example | Who may use it |
| --- | --- | --- | --- |
| **Primitives** | `tokens.css` | `--sys-blue`, `--sys-orange`, `--traffic-close` | Semantic tokens only |
| **Semantics** | `tokens.css` | `--label`, `--fill`, `--separator`, `--window`, `--selection`, `--accent` | Components |
| **Materials** | `materials.css` | `material-sidebar`, `material-popover`, `material-dock` | Components |

Primitives are Apple's published system colours, in both appearances, left exactly as Apple ships them (`#007AFF` in light, `#0A84FF` in dark and so on). Label and fill colours are alpha-based because that is how AppKit and UIKit define them: they tint whatever sits behind them, which is what makes vibrancy work.

### Appearance and accent

Two attributes on `<html>` drive everything:

```html
<html data-appearance="dark" data-accent="purple">
```

- `data-appearance` is `light` or `dark`. The default is dark. `useAppearanceStore()` owns it, and a tiny inline script in `index.html` applies the saved choice before first paint, so the page never flashes.
- `data-accent` picks one of macOS's eight accent colours: blue (the default, attribute absent), purple, pink, red, orange, yellow, green or graphite. The accent drives buttons, focus rings, selection, switches and menu highlights.

Try both in Control Center (desktop) or Settings (phone).

### Tailwind, locked down

`theme.css` wipes Tailwind's default palette, type scale, radii and shadows (`--color-*: initial` and friends) and replaces them with the tokens. So `bg-purple-500` and `text-2xl` don't compile to anything here. You get:

| Utility family | Examples |
| --- | --- |
| Text colour | `text-label`, `text-label-secondary`, `text-accent`, `text-ios-label` |
| Surfaces | `bg-window`, `bg-window-content`, `bg-window-toolbar`, `bg-ios-grouped` |
| Fills | `bg-fill`, `bg-fill-secondary`, `bg-ios-fill-tertiary` |
| Lines | `border-separator`, `border-ios-separator` |
| Selection | `bg-selection`, `bg-selection-unemphasized`, `text-on-accent` |
| System colours | `text-red`, `bg-green`, `text-orange` (status and tints, not decoration) |
| Terminal | `bg-term-bg`, `text-term-green`, `text-term-dim` |
| Shadows | `shadow-window`, `shadow-window-inactive`, `shadow-menu`, `shadow-dock` |
| Radii | `rounded-window`, `rounded-menu`, `rounded-control`, `rounded-widget`, `rounded-ios-group` |

## Materials

A material is tint + backdrop blur + saturation + a hairline edge that catches the light, which is roughly what `NSVisualEffectView` does. Thicker surfaces blur more.

| Utility | Used by |
| --- | --- |
| `material-menubar` | The menu bar |
| `material-menu` | Menus and context menus |
| `material-popover` | Control Center, tooltips, popovers |
| `material-sidebar` | Finder and Mail sidebars |
| `material-titlebar` | Title bars over scrolling content |
| `material-dock` | The Dock |
| `material-notification` | Notification banners |
| `material-widget` | Desktop widgets |
| `material-hud` | Quick Look, volume/brightness HUDs |
| `material-sheet` | Sheets |
| `material-ios-bar` | iOS navigation bars |
| `material-ios-platter` | iOS dock, widgets, notification cards |
| `material-ios-module` | Control Centre modules |

With `prefers-reduced-transparency: reduce`, every material turns into a solid surface, the same as the macOS accessibility setting.

## Type

The system font on Apple devices (SF Pro via `-apple-system`), and [Inter](https://rsms.me/inter/) everywhere else, which is the closest open match. Mono is SF Mono, then Menlo.

macOS text styles for the desktop, iOS Dynamic Type sizes for the phone, each with Apple's size-specific tracking:

| macOS | Size / leading | iOS | Size / leading |
| --- | --- | --- | --- |
| `text-large-title` | 26 / 32 | `text-ios-large-title` | 34 / 41 bold |
| `text-title-1` | 22 / 26 | `text-ios-title-1` | 28 / 34 |
| `text-title-2` | 17 / 22 | `text-ios-title-2` | 22 / 28 |
| `text-title-3` | 15 / 20 | `text-ios-title-3` | 20 / 25 |
| `text-headline` | 13 / 16 semibold | `text-ios-headline` | 17 / 22 semibold |
| `text-body` | 13 / 16 | `text-ios-body` | 17 / 22 |
| `text-callout` | 12 / 15 | `text-ios-callout` | 16 / 21 |
| `text-subheadline` | 11 / 14 | `text-ios-subheadline` | 15 / 20 |
| `text-footnote` | 10 / 13 | `text-ios-footnote` | 13 / 18 |

Headings are never italic. Hierarchy comes from size and weight.

## Shape and metrics

| Token | Value | Why |
| --- | --- | --- |
| `--radius-window` | 16px | macOS 26 window corners |
| `--radius-menu` / `--radius-menu-item` | 10px / 6px | Menus with inset rounded highlights |
| `--radius-control` | 6px | Push buttons, sidebar rows |
| `--radius-notification` | 18px | Banners |
| `--radius-widget` | 22px | Desktop and home-screen widgets |
| `--menubar-height` | 28px | |
| `--toolbar-height` | 52px | Unified toolbar |
| `--titlebar-height` | 32px | Plain title bar |
| `--traffic-size` / `--traffic-gap` | 12px / 8px | Window controls |

App icons use Apple's continuous-corner shape, drawn as a superellipse (`src/ui/app-icons/squircle.ts`) rather than a rounded rectangle, which has a visible kink where the arc meets the edge.

## Motion

- **Springs for anything you can touch** (`src/design/motion.ts`). The default is critically damped (`bounce: 0`). Bounce only follows a gesture that carried momentum, such as flicking an app closed.
- **CSS transitions** use the `ease-out` / `ease-in` / `ease-in-out` tokens (an exponential family, never the browser's `ease`) and three durations: 120ms, 220ms and 420ms. Exits run at about 75% of the enter.
- Only `transform` and `opacity` animate.
- `prefers-reduced-motion` collapses spatial motion to short cross-fades. Dock magnification turns off.
- Drags track the pointer 1:1 from where you grabbed it, and swipes carry their release velocity into the spring.

## Symbols, not emoji

The UI uses no emoji. Anywhere copy wants a symbol, `src/content` writes a short code like `:rocket:` or `:coffee:`, and `<IconText>` renders it as the matching [Lucide](https://lucide.dev) icon at 1em, on the text baseline, the way an SF Symbol sits in a line of text. Each glyph has an Apple system-colour tint, like a multicolour symbol. Terminal output renders them untinted so they take the line's colour.

```ts
subject: ':briefcase: Interested in Your Work!'   // content
<IconText :text="message.subject" />                // component
stripGlyphs(message.subject)                        // titles, inputs, aria-labels
```

- The registry lives in `src/ui/glyphs/registry.ts`, with name, icon and tint. Unknown codes stay as plain text, so `12:30:45` is safe.
- Content fields that are just an icon (Coffee topics, About fun facts) use a typed `icon: GlyphName` and render with `<Glyph :name>`.
- Places that can't hold markup (document title, input values, placeholders, `aria-label`) must go through `stripGlyphs()`.

## Brand logos

Third-party logos come from [svgl](https://svgl.app), through [`@selemondev/svgl-vue`](https://github.com/selemondev/svgl-vue), and render with `<BrandIcon name="github" :size="16" />`. They keep their real colours. Marks that are black, or have near-black parts (GitHub, X, Next.js, AWS, MongoDB), are marked with `ink` in `src/ui/brand/registry.ts`, and those parts follow the text colour, so the logo stays readable in dark mode. Content picks a brand by name: `socials` in `profile.ts`, the tech stack in `about.ts`, and verified mail senders in `mail.ts`.

## Components

Shared primitives live in [`src/ui`](src/ui). Each one covers default, hover, focus-visible, active, disabled and, where relevant, loading, success and error:

`IconText` / `Glyph` · `BrandIcon` · `UiButton` · `UiIconButton` · `UiSwitch` · `UiSlider` · `UiSegmented` · `UiSearchField` · `UiTextField` · `UiMenu` / `UiMenuItem` / `UiMenuSeparator` · `UiBadge` · `UiSpinner` · `UiProgress` · `UiSidebarSection` / `UiSidebarItem` · `UiListGroup` / `UiListRow` · `UiAppIcon` · `IosNavBar`

Window chrome for apps lives in [`src/ui/window`](src/ui/window): `WindowTitlebar`, `WindowToolbar`, `WindowSidebar` and `TrafficLights`.

Run `npm run dev` and open [`/__kit`](http://localhost:5173/__kit) to see every icon, colour, material and type style in both appearances.

## Rules of thumb

1. Reach for a semantic token before a system colour, and a system colour before anything else. Raw hex belongs in `tokens.css` and nowhere else. App-icon artwork has its own fixed palette in `src/ui/app-icons/palette.ts`, because real app icons don't change with appearance either.
2. The accent is a highlighter: selection, focus, the primary button. It never fills a whole panel.
3. The cursor is an arrow, like on a Mac. Pointer hands are for links only.
4. Every interactive element gets a visible `:focus-visible` ring, and the ring never animates in.
5. Touch targets on the phone are at least 44×44.

## Gotchas

- **Write `backdrop-filter`, never `-webkit-backdrop-filter`.** Lightning CSS adds the Safari prefix at build time. If you write both, the minifier treats the prefixed one as an override and drops the standard property, and Chrome quietly loses every blur.
- **Animated wrappers need their own layer.** A `motion.div` that fades (opacity) creates a stacking context. Give it the `z-(--z-…)` of what it wraps, or a `z-index: 9000` lock screen inside it will end up under the Dock. That same opacity also cuts `backdrop-filter` off from what's behind the wrapper, which is why the lock screen paints its own blurred wallpaper instead of blurring the desktop.
- **Layers are tokens too.** `--z-windows` < `--z-dock` < `--z-menubar` < `--z-notifications` < `--z-menus` < `--z-control-center` < `--z-system` < `--z-boot`.
