#!/usr/bin/env node
/**
 * Regenerates the README screenshots and demo clips from a running build.
 *
 *   npm run build && npm run preview      # serves on :4173
 *   npx playwright install chromium       # once
 *   npm run media                          # writes docs/media/*
 *
 * Needs ffmpeg (clips → mp4 + gif) and cwebp (stills → webp) on PATH.
 * Point it elsewhere with MEDIA_ORIGIN=http://localhost:5173.
 * Capture a subset with MEDIA_ONLY=stills or MEDIA_ONLY=clips.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { chromium, devices } from 'playwright'

const ORIGIN = process.env.MEDIA_ORIGIN ?? 'http://localhost:4173'
const ONLY = process.env.MEDIA_ONLY ?? 'all'
const OUT = resolve('docs/media')
const TMP = resolve('node_modules/.media-tmp')
const DESKTOP = { width: 1440, height: 900 }
// The preset's viewport leaves room for Safari's toolbars (393×659); use the
// whole 393×852 screen, as the installed PWA sees it, so stills and clips match.
const PHONE = {
  ...devices['iPhone 15 Pro'],
  viewport: { width: 393, height: 852 },
  screen: { width: 393, height: 852 },
  deviceScaleFactor: 2,
}

mkdirSync(OUT, { recursive: true })
rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })

const wait = (ms) => new Promise((done) => setTimeout(done, ms))
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' })

function toWebp(png, name) {
  run('cwebp', ['-quiet', '-q', '86', '-m', '6', png, '-o', join(OUT, `${name}.webp`)])
  console.log(`✓ ${name}.webp`)
}

/** webm → mp4 (linked, full quality) + gif (inline README playback). */
function toClip(webm, name, width) {
  const mp4 = join(OUT, `${name}.mp4`)
  const gif = join(OUT, `${name}.gif`)
  run('ffmpeg', ['-loglevel', 'error', '-y', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', '-an', mp4])
  const filter =
    `fps=12,scale=${width}:-1:flags=lanczos,split[a][b];` +
    `[a]palettegen=max_colors=128:stats_mode=diff[p];` +
    `[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`
  run('ffmpeg', ['-loglevel', 'error', '-y', '-i', webm, '-vf', filter, '-loop', '0', gif])
  const mb = (f) => (statSync(f).size / 1e6).toFixed(1)
  console.log(`✓ ${name} (mp4 ${mb(mp4)} MB, gif ${mb(gif)} MB)`)
}

async function open(browser, { appearance = 'dark', accent = 'blue', phone = false, video = false } = {}) {
  const options = phone ? { ...PHONE } : { viewport: DESKTOP, deviceScaleFactor: 2 }
  if (video) {
    options.deviceScaleFactor = phone ? 2 : 1
    const size = phone ? { width: 393, height: 852 } : DESKTOP
    options.recordVideo = { dir: TMP, size }
  }
  const ctx = await browser.newContext({ ...options, reducedMotion: 'no-preference' })
  await ctx.addInitScript(
    ([mode, accent]) => localStorage.setItem('satyajitos:appearance', JSON.stringify({ mode, accent })),
    [appearance, accent],
  )
  const page = await ctx.newPage()
  return { ctx, page }
}

async function shot(page, name) {
  const png = join(TMP, `${name}.png`)
  await page.screenshot({ path: png })
  toWebp(png, name)
}

/** Calls an action on a Pinia store inside the page. */
function store(page, id, action, ...args) {
  return page.evaluate(
    ([id, action, args]) => {
      const pinia = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia
      return pinia._s.get(id)?.[action]?.(...args)
    },
    [id, action, args],
  )
}

/** Welcome banners arrive 1–5s after boot; wait them out, then clear the stage. */
async function settle(page) {
  await wait(5600)
  await store(page, 'notifications', 'clearAll')
}

/** Clears banners that apps post on open (Finder says hello) and waits for the exit. */
async function quiet(page) {
  await wait(900)
  await store(page, 'notifications', 'clearAll')
  await wait(500)
}

async function frame(page, id, x, y, width, height) {
  await store(page, 'windows', 'resize', id, { x, y, width, height })
}

async function typeInTerminal(page, command) {
  await page.locator('[data-window="terminal"]').click({ position: { x: 300, y: 200 } })
  await page.keyboard.type(command, { delay: 45 })
  await page.keyboard.press('Enter')
  await wait(400)
}

async function finishClip(ctx, page, name, width) {
  const video = page.video()
  await ctx.close()
  const webm = join(TMP, `${name}.webm`)
  renameSync(await video.path(), webm)
  toClip(webm, name, width)
}

const browser = await chromium.launch()

if (ONLY !== 'clips') {
  // ── Desktop ────────────────────────────────────────────────────────────
  for (const appearance of ['dark', 'light']) {
    const { ctx, page } = await open(browser, { appearance })
    await page.goto(`${ORIGIN}/?boot=skip`)
    await wait(2600)
    await shot(page, `desktop-${appearance}`)

    await settle(page)
    await store(page, 'windows', 'open', 'finder')
    await wait(700)
    await frame(page, 'finder', 120, 64, 880, 540)
    await store(page, 'windows', 'open', 'terminal')
    await wait(700)
    await frame(page, 'terminal', 620, 330, 700, 450)
    await typeInTerminal(page, 'neofetch')
    await quiet(page)
    await shot(page, `desktop-apps-${appearance}`)
    await ctx.close()
  }

  for (const [app, w, h] of [['about', 580, 540], ['coffee', 680, 600], ['email', 1100, 640], ['finder', 1000, 620]]) {
    const { ctx, page } = await open(browser)
    await page.goto(`${ORIGIN}/app/${app}?boot=skip`)
    await settle(page)
    await frame(page, app, Math.round((1440 - w) / 2), 60, w, h)
    await quiet(page)
    await shot(page, `app-${app}`)
    await ctx.close()
  }

  {
    const { ctx, page } = await open(browser)
    await page.goto(`${ORIGIN}/app/terminal?boot=skip`)
    await settle(page)
    await frame(page, 'terminal', 250, 60, 940, 600)
    for (const cmd of ['ls', 'cat ~/Desktop/secret_project.md', 'sudo rm -rf /', 'cowsay ship it']) {
      await typeInTerminal(page, cmd)
    }
    await quiet(page)
    await shot(page, 'app-terminal')
    await ctx.close()
  }

  {
    const { ctx, page } = await open(browser, { appearance: 'light', accent: 'purple' })
    await page.goto(`${ORIGIN}/app/finder?boot=skip`)
    await settle(page)
    await frame(page, 'finder', 90, 70, 900, 560)
    await quiet(page)
    await page.getByRole('button', { name: 'Control Center' }).click()
    await wait(700)
    await shot(page, 'desktop-control-center')
    await ctx.close()
  }

  {
    const { ctx, page } = await open(browser)
    await page.goto(`${ORIGIN}/?boot=skip`)
    await settle(page)
    await store(page, 'system', 'lockScreen')
    await wait(1400)
    await shot(page, 'desktop-lock')
    await ctx.close()
  }

  // ── Phone ──────────────────────────────────────────────────────────────
  for (const appearance of ['dark', 'light']) {
    const { ctx, page } = await open(browser, { appearance, phone: true })
    await page.goto(`${ORIGIN}/?boot=skip`)
    await wait(2200)
    await shot(page, `phone-home-${appearance}`)
    await ctx.close()
  }
  for (const app of ['about', 'email', 'finder', 'terminal', 'settings', 'coffee']) {
    const { ctx, page } = await open(browser, { phone: true })
    await page.goto(`${ORIGIN}/app/${app}?boot=skip`)
    await wait(2200)
    await shot(page, `phone-${app}`)
    await ctx.close()
  }
  for (const [panel, label] of [['control', 'Open Control Centre'], ['notifications', 'Open Notification Centre']]) {
    const { ctx, page } = await open(browser, { phone: true })
    await page.goto(`${ORIGIN}/?boot=skip`)
    await wait(2000)
    await page.getByRole('button', { name: label }).click()
    await wait(900)
    await shot(page, `phone-${panel}`)
    await ctx.close()
  }
}

if (ONLY !== 'stills') {
  // ── Clips ──────────────────────────────────────────────────────────────
  {
    const { ctx, page } = await open(browser, { video: true })
    await page.goto(ORIGIN)
    await wait(6500)
    await finishClip(ctx, page, 'clip-boot', 800)
  }
  {
    const { ctx, page } = await open(browser, { video: true })
    await page.goto(`${ORIGIN}/?boot=skip`)
    await wait(1500)
    await store(page, 'notifications', 'clearAll')
    const dock = await page.locator('nav[aria-label="Dock"]').boundingBox()
    const y = dock.y + dock.height / 2
    for (let x = dock.x - 20; x <= dock.x + dock.width + 20; x += 8) {
      await page.mouse.move(x, y)
      await wait(14)
    }
    const dockItem = (name) => page.locator('nav[aria-label="Dock"]').getByRole('button', { name, exact: true })
    await dockItem('Finder').click()
    await wait(1200)
    // Drag Finder around by its toolbar.
    const bar = await page.locator('[data-window="finder"] [data-drag-region]').last().boundingBox()
    await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2)
    await page.mouse.down()
    for (let i = 0; i <= 30; i++) {
      await page.mouse.move(bar.x + bar.width / 2 - i * 8, bar.y + bar.height / 2 - i * 2)
      await wait(16)
    }
    await page.mouse.up()
    await dockItem('Terminal').click()
    await wait(1200)
    await typeInTerminal(page, 'neofetch')
    await wait(1500)
    await page.locator('[data-window="terminal"] button[aria-label="Minimize"]').click()
    await wait(1400)
    await finishClip(ctx, page, 'clip-desktop', 800)
  }
  {
    const { ctx, page } = await open(browser, { video: true })
    await page.goto(`${ORIGIN}/app/finder?boot=skip`)
    await wait(1500)
    await store(page, 'notifications', 'clearAll')
    await page.getByRole('button', { name: 'Control Center' }).click()
    await wait(900)
    for (const name of ['Purple', 'Pink', 'Orange', 'Green', 'Blue']) {
      await page.getByRole('radio', { name }).click().catch(() => {})
      await wait(550)
    }
    await store(page, 'appearance', 'setMode', 'light')
    await wait(1400)
    await store(page, 'appearance', 'setMode', 'dark')
    await wait(1200)
    await finishClip(ctx, page, 'clip-appearance', 800)
  }
  {
    const { ctx, page } = await open(browser, { phone: true, video: true })
    await page.goto(ORIGIN)
    await wait(3600)
    await page.getByRole('button', { name: /^Mail/ }).first().click()
    await wait(1800)
    // Swipe up on the home indicator to go home.
    const bar = await page.getByRole('button', { name: 'Go to Home Screen' }).boundingBox()
    if (bar) {
      await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2)
      await page.mouse.down()
      for (let i = 0; i < 18; i++) {
        await page.mouse.move(bar.x + bar.width / 2, bar.y - i * 22)
        await wait(14)
      }
      await page.mouse.up()
    }
    await wait(1200)
    await page.getByRole('button', { name: 'Open Control Centre' }).click()
    await wait(2000)
    await finishClip(ctx, page, 'clip-phone', 360)
  }
}

await browser.close()
rmSync(TMP, { recursive: true, force: true })
console.log(`\nMedia in ${OUT}:\n${readdirSync(OUT).sort().join('\n')}`)
