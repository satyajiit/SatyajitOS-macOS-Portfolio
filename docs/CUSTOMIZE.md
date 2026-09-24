# Make it yours

SatyajitOS keeps every word, photo and joke about its owner in [`src/content`](../src/content). The components only render that data, so turning this into *YourNameOS* is mostly editing TypeScript objects. Plan on an afternoon, and some of that is choosing a wallpaper.

## 1. Rename the OS

[`src/content/site.ts`](../src/content/site.ts) holds the OS name, page title, description and theme colour. `vite.config.ts` reads it to build the PWA manifest, so the installed app picks up your name too.

```ts
export const site = {
  osName: 'JaneOS',
  osNameBoldSuffix: 'OS',
  title: 'Jane Doe — Designer who ships | JaneOS',
  // …
}
```

`index.html` repeats the title and Open Graph tags as static HTML, because link previews don't run JavaScript. Update those too.

## 2. Tell it who you are

[`src/content/profile.ts`](../src/content/profile.ts) holds your name, username (used in the Terminal prompt and on the lock screen), role, location, email and social links. Replace `src/assets/images/own_pic.webp` with your photo: square, at least 512px, WebP or JPG.

## 3. Rewrite the apps

| File | What's in it |
| --- | --- |
| `content/about.ts` | The "About This Human" spec sheet, achievements, skills, fun facts |
| `content/coffee.ts` | Coffee Chat topics, time slots, coffee personalities |
| `content/mail.ts` | Every email in the inbox (yes, including the Nigerian prince) |
| `content/files.ts` | The whole Finder file system: folders, files, previews |
| `content/terminal.ts` | Terminal banner, file tree, fortunes and easter-egg output |
| `content/quotes.ts` | Quotes in the desktop and home-screen widget |
| `content/system.ts` | Boot, lock, sleep, restart and shutdown copy, plus the lock-screen password and hint |
| `content/desktop.ts` | Welcome notifications on the Mac |
| `content/mobile.ts` | Seed notifications and Control Centre copy on the phone |

Everything is typed, so `npm run type-check` catches a missing field before a visitor does.

## 4. Add or remove an app

Apps are listed once in [`src/apps/registry.ts`](../src/apps/registry.ts), in Dock order. Each entry points at a desktop component (rendered inside a macOS window) and/or a mobile component (rendered full-screen on the phone):

```ts
{
  id: 'music',
  name: 'Music',
  icon: 'music',               // key in src/ui/app-icons
  description: 'What I have on repeat',
  dock: true,
  desktopIcon: true,
  desktop: {
    component: () => import('./music/MusicDesktop.vue'),
    title: 'Music',
    width: 800, height: 520, minWidth: 600, minHeight: 400,
    chrome: 'toolbar',         // or 'titlebar'
  },
  mobile: { component: () => import('./music/MusicMobile.vue') },
}
```

Then:

1. Add `'music'` to the `AppId` union at the top of the registry.
2. Draw an icon in `src/ui/app-icons/MusicIcon.vue`. Copy `MailIcon.vue`: it's an SVG on the shared squircle path. Register it in `src/ui/app-icons/index.ts`.
3. Build the two components. On desktop, start with `<WindowToolbar>` or `<WindowTitlebar>` from `@/ui/window`. On the phone, start with `<IosNavBar>` from `@/ui`.
4. Open `http://localhost:5173/__app/music` (and `?shell=mobile`) to work on it in isolation.

The Dock, desktop icons, home screen, menu bar and routing all pick the new app up from the registry.

## 5. Change the look

- **Accent colour:** visitors pick their own in Control Center. To change the default, set `accent` in `src/stores/appearance.ts` and in the inline script in `index.html`.
- **Light by default:** change `mode: 'dark'` to `'light'` or `'auto'` in the same two places.
- **Wallpaper:** replace `src/assets/wallpapers/horizon-{dark,light}.webp` with images of about 2560×1600. The `.source.svg` files next to them are the editable originals.
- **Anything else visual:** read [`DESIGN.md`](../DESIGN.md) first. Every colour, radius and shadow is a token, so there is usually one place to change.

## 6. Analytics (optional)

Analytics is off by default and costs nothing when off. To use Firebase Analytics, copy `.env.example` to `.env.local` and fill in the `VITE_FIREBASE_*` values. For GitHub Pages, add them as repository secrets and pass them to the build step in `.github/workflows/deploy.yml`. Firebase web keys are public by design, but restrict yours to your domain in the Google Cloud console anyway.

## 7. Ship it

- **GitHub Pages:** push to `main`. `.github/workflows/deploy.yml` builds with the right sub-path (`/<repo>/`) and publishes. In your repo, set **Settings → Pages → Source** to **GitHub Actions**, once.
- **Custom domain:** set `VITE_BASE=/` and `VITE_SITE_URL=https://your.domain`, then add a `CNAME` file in `public/`.
- **Firebase Hosting / Netlify / Vercel / anything static:** `npm run build` and upload `dist/`. Send every path to `index.html`; `firebase.json` already does this.

## 8. Refresh the screenshots

```bash
npm run build && npm run preview       # serves the production build on :4173
npx playwright install chromium        # once
npm run media                          # rewrites docs/media/*
```

This needs `ffmpeg` and `cwebp` on your PATH (`brew install ffmpeg webp`).

Please don't ship a fork with my face on it. Everything else is yours: MIT.
