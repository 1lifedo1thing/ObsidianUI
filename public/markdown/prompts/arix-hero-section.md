# ObsidianUI prompt: Arix Hero section

A scroll-driven hero where a rotating ring of tutor tiles scatters, reveals text word by word, and flies past the camera. skydrive hero recreate prompt :)

- Category: Hero
- Published: 2026-10-09
- Author: Atharv
- Page: https://www.obsidianui.dev/prompts/arix-hero-section
- Live preview: https://herosection-v1.athrix.me

> This is the exact prompt behind the Arix hero video. Paste it into a coding agent and it builds the full page in one pass: Next.js 16, React 19, TypeScript, and plain CSS Modules, with no animation libraries. The prompt spells out the assets, the copy, the layout, the scroll math for every phase, accessibility, and Vercel deployment.

## What you get

- **A ring of 16 character tiles** that slowly rotates around the headline and call to action.
- **A scroll-driven sequence:** the tiles scatter to different depths, a paragraph reveals word by word, every tile flies past the camera, and a lesson chat preview rises into view.
- **Reversible motion** written from one `requestAnimationFrame` loop, with a reduced-motion path that only cross-fades.
- **Production details:** a responsive header with a mobile menu, a skip link, focus rings, and a verification checklist the agent runs before it finishes.

> **Recommended models:** Claude Sonnet 5 or Claude Opus 5.5. The prompt is long and precise, so a strong coding model follows the motion math most faithfully.

## The prompt

### Arix Hero section

````text
## Role and goal

You are a senior frontend engineer. Build a single-page marketing site for **Arix**, a language-tutoring product whose tutors are characterful felt-puppet personalities. The page is one long scroll-driven sequence built around a ring of character tiles. Build it in **Next.js 16 (App Router) + React 19 + TypeScript**, styled with **plain CSS Modules** (no Tailwind, no animation libraries). The site must deploy to **Vercel with zero configuration**.

Build the whole thing in one pass, then run lint and a production build, and fix anything that fails.

## The experience, in order

The page has a fixed header, then one tall "stage" section (520svh) whose inner layer is `position: sticky` and fills the viewport. Everything below happens inside that sticky layer and is driven by scroll progress `p` from 0 to 1 across the stage.

1. **Hero (p ≈ 0).** 16 rounded portrait tiles of puppet characters sit evenly spaced on a circle around a centred headline, a dark CTA button, and a "Practice on" row with three small icons. The ring slowly rotates clockwise on its own. Tiles on the lower arc are slightly larger, as if the ring tilts toward the viewer. On load, tiles fade and scale in one after another. A "Learn in" strip with language badges sits at the bottom.
2. **Scatter (p 0.05 → 0.30).** The hero text fades up and away. Each tile pulls in toward the centre (slightly below it), then spreads out to its own scattered position at its own depth. Far tiles are smaller and paler, near tiles larger. Tiles start at staggered moments. Once scattered they drift gently.
3. **Word reveal (p 0.17 → 0.56).** A centred paragraph fades in with every word light gray, then words turn black one by one as you scroll, with a soft 3-word gradient at the leading edge.
4. **Fly-through (p 0.62 → 0.87).** Every tile accelerates toward the camera: it grows, moves outward from the centre, and fades out before it would pass the viewer. Meanwhile the paragraph dims to gray, then fades out while drifting up.
5. **Chat preview (p 0.83 → 0.97).** A mock lesson chat window rises from below and fades in, ending centred and fully opaque.
6. After the stage, a small footer.

Everything is scroll-linked and reversible: scrolling up plays it backwards.

## Project setup

- Scaffold with `create-next-app` (TypeScript, App Router, ESLint, no Tailwind, no `src/` dir, import alias `@/*`).
- Delete the starter `app/page.module.css` and the starter SVGs in `public/`.
- In `package.json` add `"engines": { "node": ">=20.9.0" }`.
- Next.js 16 notes: `next/image` uses `preload` (not the deprecated `priority`). The default image quality whitelist is `[75]`, so don't pass other `quality` values. `LayoutProps<"/">` is the global type for the root layout props.
- Font: **Inter** via `next/font/google`, exposed as the CSS variable `--font-inter`.

### Files to create

```
app/
  layout.tsx              Inter font, metadata, viewport themeColor
  page.tsx                Skip link, SiteHeader, <main> with HeroSequence, footer
  globals.css             Tokens, reset, focus ring, sr-only, skip link, footer
components/
  SiteHeader.tsx          Client component: fixed header + mobile menu
  SiteHeader.module.css
  HeroSequence.tsx        Client component: the whole scroll stage
  HeroSequence.module.css
  LessonMock.tsx          Chat preview (no hooks)
  LessonMock.module.css
  icons.tsx               Inline SVG icons
public/
  avatars/tutor-01.webp … tutor-16.webp
  factory-mark-black.svg
README.md                 Deploy-with-Vercel instructions
```

## Design tokens (`app/globals.css`)

```css
:root {
  --canvas: #f6f6f6;      /* page background */
  --ink: #111111;         /* headings, revealed words */
  --ink-soft: #3d3b39;    /* nav links, secondary text */
  --ink-muted: #6b6966;   /* captions, labels */
  --cta: #272523;         /* warm near-black buttons */
  --cta-hover: #3a3734;
  --line: #e6e4e1;        /* hairline borders */
  --surface: #ffffff;     /* cards, menus */
  --focus: #1d5fd1;       /* focus ring */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

Base styles: `box-sizing: border-box` everywhere; body uses `--canvas` and `--ink`, Inter, 16px, line-height 1.5, antialiased; links inherit colour with no underline; images are `display: block`.

Shared utilities:
- `:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }`
- `.sr-only`: the standard visually hidden pattern.
- `.skip-link`: fixed top-left dark pill ("Skip to content" → `#main`), translated off-screen until focused.
- `main:focus { outline: none; }` (main has `tabIndex={-1}` as the skip target).
- `.site-footer`: centred, 14px, muted, padding `2rem clamp(1rem, 3.6vw, 3.75rem)`. Paragraphs have no margin, with 0.25rem between them. Links are `--ink-soft`, underlined, `text-underline-offset: 3px`.

Corner radius language is **semi-rounded, never full pills** for buttons and nav: 8–12px.

## Assets

### Character tiles (16 images)

Generate original images (do not copy any existing brand's characters). Generate **four 2×2 sheets** with an image model, then crop each sheet into four portrait tiles. Use this prompt template and change only the four character descriptions:

> A 2x2 grid of four separate square portrait tiles, separated by thin pure white gutters, each tile filling exactly one quadrant. Each tile is a studio photograph of a handmade felt puppet character (fuzzy fleece skin, big round white ping-pong-ball eyes with small black pupils, a tiny stitched smile), shown head and shoulders, centered, facing camera, with generous space above the head. Every tile has the identical soft warm backdrop: a smooth vertical gradient from muted dusty rose at top to pale peach-beige at bottom, soft studio lighting, photorealistic 3D render look. Tile 1 (top-left): … Tile 2 (top-right): … Tile 3 (bottom-left): … Tile 4 (bottom-right): … No text, no logos, no watermark, no borders other than the white gutters.

Characters, in tile order 01–16:

| # | Character |
|---|---|
| 01 | violet purple skin, short black blunt bob, black turtleneck |
| 02 | tangerine orange skin, curly copper-red hair, cream knit cardigan |
| 03 | sunflower yellow skin, spiky orange hair, white zip hoodie |
| 04 | cobalt blue skin, tight navy curls, round thin glasses, off-white shirt |
| 05 | bright teal skin, long silver-white straight hair, beige linen jacket |
| 06 | hot pink skin, magenta top bun, thick round black glasses, white collared shirt |
| 07 | olive green skin, shaggy moss-green yarn hair, taupe knit sweater |
| 08 | raspberry pink skin, long straight rose-pink hair, ivory blouse |
| 09 | lime green skin, wavy golden-blonde shoulder-length hair, cream sweater |
| 10 | pumpkin orange skin, long sleek orange-red hair, white ribbed turtleneck |
| 11 | mint green skin, bubblegum-pink space buns, headphones around neck, white tee |
| 12 | aqua turquoise skin, short tousled grey hair, tan corduroy jacket |
| 13 | leaf green skin, short spiky rust-red hair, oatmeal overshirt |
| 14 | soft pink skin, platinum-blonde blunt bob with bangs, white mock-neck top |
| 15 | slate blue skin, sleek black chin-length bob, cream blazer |
| 16 | coral orange skin, light blue-white fluffy wavy hair, sand sweater |

Crop with ffmpeg. **Check the real sheet size first.** Generators often return 1254×1254, not 1024. Scale to 1024 before cropping. Each tile is 400×480 (5:6 portrait), WebP quality 82:

```bash
# offsets after scaling to 1024x1024: TL (56,14)  TR (568,14)  BL (56,528)  BR (568,528)
ffmpeg -i sheet.png -vf "scale=1024:1024:flags=lanczos,crop=400:480:56:14" -quality 82 public/avatars/tutor-01.webp
```

Inspect the 16 results as a contact sheet and confirm that every face is centred and no white gutter shows.

### Header logo

Use the Factory mark only (the icon part of the Factory lockup SVG, not the "FACTORY" wordmark). Save it as `public/factory-mark-black.svg` with `viewBox="0 0 218 218"`, containing only the mark's path (in the lockup it is the path whose coordinates sit in x 0–218).

### Icons (`components/icons.tsx`)

All icons are inline SVG with `aria-hidden` and `focusable="false"`. Never use emoji, icon fonts, or raster icons.
- `PhoneIcon`, `BrowserIcon`, `HeadphonesIcon`: 20×20 viewBox, a rounded square (`rx 4.5`) filled green `#34b26a`, blue `#4f8ef0`, and coral `#f08a5d` respectively, with a white 1.4px-stroke glyph (phone outline, browser window with a top bar, headphones).
- `MenuIcon` (two lines), `CloseIcon` (X), `SendIcon` (up arrow), `MicIcon`: `currentColor` strokes, 1.5–1.6px, round caps.

## Copy (use exactly)

- `<title>`: `Arix | Language tutors with real character`
- Meta description: `Arix pairs you with characterful language tutors who remember every conversation and keep pace as your fluency grows.`
- Header brand link text: `Made with FactoryAI`
- Nav: `Tutors`, `Languages`, `Schools`, `Pricing`, `Journal` (href `#` placeholders)
- Header actions: `Log in`, `Meet your first tutor`
- Headline (two lines): `Language tutors` / `with character`
- Hero CTA: `Meet your first tutor`
- Channels row: `Practice on` + phone, browser, headphones icons (screen-reader text: "your phone, the web, or voice calls")
- Strip: `Learn in` + badges `ES FR JA KO DE` + `+24 more` (screen-reader text: "Spanish, French, Japanese, Korean, German, and")
- Paragraph: `Arix tutors aren’t flashcards or phrasebooks. They’re characters with names, accents, and opinions who remember every conversation. They meet you at your level on day one, and keep pace as your fluency grows.`
- Footer line 1: `© 2026 Arix`
- Footer line 2: `Made by ` + link `https://x.com/athrix_codes` (link text is the full URL, opens in a new tab)

## Header (`SiteHeader.tsx`, client component)

- `position: fixed` across the top, `z-index: 50`, height `4.5rem`, `padding-inline: clamp(1rem, 3.6vw, 3.75rem)`, CSS grid `1fr auto 1fr` (brand left, nav centre, actions right). No background. The header itself has `pointer-events: none` and its direct children `auto`, so tiles show through and the empty areas don't block anything.
- **Brand link** (left): `href="https://app.factory.ai#utm_source=x.com%2Fathrix_codes&utm_campaign=Ambassador"`, `target="_blank" rel="noopener noreferrer"`, inline-flex, `gap: 0.5rem`. Contents: the Factory mark via `next/image` (`width/height 218`, rendered 20×20, `preload`, `unoptimized`, `alt=""`), then the text `Made with FactoryAI` (15px, weight 600, `line-height: 1`, `letter-spacing: -0.01em`, `--ink`, nowrap, `translate: 0 0.125rem` to optically centre it against the icon).
- **Nav** (centre, shown at ≥860px): a `<ul>` bar with `padding: 0.25rem`, `gap: 0.25rem`, `border-radius: 0.75rem`, background `rgb(255 255 255 / 0.45)`, `backdrop-filter: blur(10px)`. Links: min-height 2.25rem, `padding: 0 0.75rem`, `border-radius: 0.5rem`, 15px, `--ink-soft`. On hover (only `(hover: hover) and (pointer: fine)`): background `rgb(17 17 17 / 0.05)`, colour `--ink`, 150ms ease-out transition on background-color and color only.
- **Actions** (right): `Log in` (shown ≥860px; min-height 2.5rem, `padding: 0 0.75rem`, radius 0.625rem, 15px/500) and the CTA (shown ≥560px; min-height 2.5rem, `padding: 0 1.25rem`, radius 0.625rem, `--cta` background, white 15px/500, nowrap, hover `--cta-hover`, `:active { scale: 0.96 }` with a 150ms transition).
- **Mobile menu button** (hidden ≥860px): 44×44, radius 0.625rem, `rgb(255 255 255 / 0.7)` plus blur, `aria-expanded`, `aria-controls="mobile-menu"`, sr-only label "Open menu" or "Close menu", swapping MenuIcon and CloseIcon.
- **Mobile menu panel**: `hidden` attribute when closed; absolute at `top: 4.25rem`, inset left and right by the header padding; white, radius 1.25rem, `padding: 0.5rem`, soft two-layer shadow. Lists the 5 links plus `Log in` as 48px-tall rows (radius 0.75rem). Escape closes it and returns focus to the toggle; resizing to ≥860px closes it; clicking a link closes it.

## Hero stage (`HeroSequence.tsx`, client component)

### Markup

```
<section class="stage" aria-labelledby="hero-title">         height: 520svh (520vh fallback)
  <div class="sticky">                                        sticky; top 0; height 100svh; overflow hidden; --tile var
    <div class="tiles" aria-hidden="true">                    absolute inset 0
      16 × <div class="tile"><Image …/></div>
    <div class="hero">  h1#hero-title, CTA <a>, channels <p>   absolute inset 0, flex column centred, z-index 300
    <div class="strip"> Learn in …                             absolute bottom, z-index 300
    <p id="tutors" class="paragraph"> word spans               absolute centred, z-index 300
    <div class="mock"> <LessonMock/>                           absolute inset 0, flex centred, z-index 300
```

All layer styles (transform, opacity, visibility, z-index) are written directly to `element.style` from one `requestAnimationFrame` loop. Do not use React state for animation.

### CSS

- `.tile`: `position: absolute; top: 50%; left: 50%; width: var(--tile); aspect-ratio: 5/6;` negative margins `calc(var(--tile) * -0.6)` top and `calc(var(--tile) * -0.5)` left (centred on the origin), `overflow: hidden`, `border-radius: calc(var(--tile) * 0.13)`, fallback background `linear-gradient(#c98a86, #edc6a6)`, shadow `0 1px 2px rgb(60 30 20 / 0.08), 0 8px 18px -6px rgb(60 30 20 / 0.22)`, `opacity: 0` initially, `will-change: transform, opacity`. The image fills it with `object-fit: cover`. Use `next/image` with `width 400 height 480 sizes="200px" loading="eager" alt=""`.
- `.hero`: `padding: 4.5rem 1.5rem 0.5rem`, centred text, `pointer-events: none` with children `auto`.
- `.title`: `font-size: clamp(1.625rem, 1rem + 1.5vw + 1.6vh, 3.5rem)`, weight 500, line-height 1.06, `letter-spacing: -0.04em`. Each line is a `display: block` span (no `<br>`).
- Hero `.cta`: min-height 2.75rem, `padding: 0 1.5rem`, `border-radius: 0.75rem`, `margin-top: clamp(1.25rem, 3.4vh, 2rem)`, `--cta`, white 16px/500, the same hover and press behaviour as the header CTA.
- `.channels`: inline-flex, gap 0.75rem, `margin-top: 1rem`, 14px, `--ink-muted`. Icons are 18px with a 0.625rem gap.
- `.strip`: centred at `bottom: 1.25rem` on mobile. At ≥860px it is right-aligned at `right: clamp(1rem, 3.6vw, 3.75rem); bottom: 1.5rem`. 14px muted, gap 0.75rem. Badges are 22×22, `1.5px solid var(--ink-soft)`, radius 6px, 9px bold text.
- `.paragraph`: `top: 50%; left: 50%; translate: -50% -50%; width: min(calc(100% - 3rem), 23em)`, `font-size: clamp(1.3125rem, 0.9rem + 1.3vw, 2rem)`, weight 500, line-height 1.3, `letter-spacing: -0.02em`, centred, `text-wrap: pretty`, `opacity: 0` initially. Each `.word` starts at `opacity: 0.16`.
- `.mock`: `padding: 5.5rem clamp(1rem, 4vw, 3rem) 2rem`, `opacity: 0; visibility: hidden` initially.

### Tile data (scatter rest positions)

`x` and `y` are fractions of the stage (0–1). `z` is depth in px (negative is farther, positive is nearer).

```ts
const tutors = [
  { src: "/avatars/tutor-01.webp", x: 0.10, y: 0.17, z: 160 },
  { src: "/avatars/tutor-02.webp", x: 0.80, y: 0.15, z: 150 },
  { src: "/avatars/tutor-03.webp", x: 0.64, y: 0.22, z: -140 },
  { src: "/avatars/tutor-04.webp", x: 0.34, y: 0.23, z: -260 },
  { src: "/avatars/tutor-05.webp", x: 0.50, y: 0.27, z: -560 },
  { src: "/avatars/tutor-06.webp", x: 0.90, y: 0.43, z: 110 },
  { src: "/avatars/tutor-07.webp", x: 0.15, y: 0.46, z: -40 },
  { src: "/avatars/tutor-08.webp", x: 0.24, y: 0.66, z: -150 },
  { src: "/avatars/tutor-09.webp", x: 0.70, y: 0.64, z: -90 },
  { src: "/avatars/tutor-10.webp", x: 0.45, y: 0.66, z: -460 },
  { src: "/avatars/tutor-11.webp", x: 0.82, y: 0.70, z: 120 },
  { src: "/avatars/tutor-12.webp", x: 0.57, y: 0.74, z: -270 },
  { src: "/avatars/tutor-13.webp", x: 0.36, y: 0.75, z: -260 },
  { src: "/avatars/tutor-14.webp", x: 0.09, y: 0.81, z: 110 },
  { src: "/avatars/tutor-15.webp", x: 0.67, y: 0.87, z: 170 },
  { src: "/avatars/tutor-16.webp", x: 0.31, y: 0.64, z: -560 },
];
```

### Helpers

```ts
const PERSPECTIVE = 900;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const range = (v, start, end) => clamp01((v - start) / (end - start));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
```

Do the projection in JavaScript (no CSS `perspective`): `scale = PERSPECTIVE / (PERSPECTIVE - z)`.

### Measurement (on mount and via `ResizeObserver` on the sticky layer)

```ts
width = sticky.clientWidth; height = sticky.clientHeight;
const radius = Math.min(height * 0.34, width * 0.42);
radiusX = radius;
radiusY = radius * 1.02;
if (width / height < 0.85) radiusY = Math.min(height * 0.3, width * 0.68); // tall ellipse on narrow screens
const tile = Math.max(44, Math.min(104, radius * 0.22));
sticky.style.setProperty("--tile", `${tile}px`);
```

### Per-frame render `render(p, seconds)`

`p = clamp01(-stage.getBoundingClientRect().top / (stage.offsetHeight - viewportHeight))`. `seconds` is the time since mount. `reduced` is `matchMedia("(prefers-reduced-motion: reduce)").matches`, read every frame. `time = reduced ? 0 : seconds`. `portrait = width / height < 0.85`.

For each tile `i` (0–15):

```ts
const entrance = reduced ? 1 : easeOut(clamp01((seconds - 0.1 - i * 0.045) / 0.7));

// ring
const angle = -Math.PI / 2 + (i / 16) * Math.PI * 2 + time * 0.045;   // clockwise, ~2.6°/s
const ringX = Math.cos(angle) * radiusX;
const ringY = Math.sin(angle) * radiusY;
const ringScale = 1 + 0.07 * Math.sin(angle);                        // lower arc reads closer

// scatter rest
let restY = tutor.y;
if (portrait) { const o = restY - 0.5; restY = 0.5 + Math.sign(o) * (0.21 + Math.abs(o) * 0.62); }
const driftX = Math.sin(time * 0.7 + i * 1.3) * 7;
const driftY = Math.cos(time * 0.55 + i * 2.1) * 7;
const restX = (tutor.x - 0.5) * width + driftX;
const restPy = (restY - 0.5) * height + driftY;
const restScale = PERSPECTIVE / (PERSPECTIVE - tutor.z);
const restOpacity = tutor.z < -200 ? lerp(1, 0.45, clamp01((-tutor.z - 200) / 360)) : 1;

const stagger = (((i * 7) % 16) / 16) * 0.05;
```

Full motion (not reduced):

```ts
const e = easeInOut(range(p, 0.05 + stagger, 0.25 + stagger));
const arc = Math.sin(Math.PI * e);
const pull = 1 - 0.45 * arc;                         // converge toward centre mid-transition
x = lerp(ringX, restX, e) * pull;
y = lerp(ringY, restPy, e) * pull + arc * height * 0.06;   // dip slightly below centre
scale = lerp(ringScale, restScale, e) * (1 - 0.3 * arc);
opacity = lerp(1, restOpacity, e);

const fly = easeIn(range(p, 0.62 + stagger * 0.6, 0.84 + stagger * 0.6));
if (fly > 0) {
  const depth = PERSPECTIVE - (tutor.z + fly * 1600);
  if (depth < 80) { opacity = 0; scale = PERSPECTIVE / 80; }
  else {
    const flyScale = PERSPECTIVE / depth;
    const k = flyScale / restScale;
    x = restX * k; y = restPy * k; scale = flyScale;
    opacity = lerp(restOpacity, 1, clamp01(fly * 3)) * (1 - range(flyScale, 2.6, 5));
  }
}
```

Reduced motion (cross-fades only: no travel, no rotation, no drift):

```ts
if (p < 0.13) { x = ringX; y = ringY; scale = ringScale; opacity = 1 - range(p, 0.06, 0.12); }
else          { x = restX; y = restPy; scale = restScale; opacity = restOpacity * range(p, 0.14, 0.22); }
opacity *= 1 - range(p, 0.62, 0.72);
```

Then for every tile:

```ts
opacity *= entrance;
scale *= lerp(0.85, 1, entrance);
el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
el.style.opacity = String(opacity);
el.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
el.style.zIndex = String(Math.round(scale * 100));   // nearer tiles stack on top
```

Text layers. A `setLayer(el, opacity, transform)` helper also sets `visibility: hidden` at opacity 0, which keeps hidden links out of the tab order:

```ts
const heroOut = range(p, 0.03, 0.12);
setLayer(hero, 1 - heroOut, reduced ? "none" : `translateY(${-heroOut * 32}px) scale(${1 - heroOut * 0.04})`);
setLayer(strip, 1 - range(p, 0.02, 0.08), "none");

const paraIn = easeOut(range(p, 0.17, 0.27));
const paraDim = range(p, 0.68, 0.78);
const paraOut = range(p, 0.78, 0.87);
setLayer(paragraph, paraIn * (1 - paraOut),
  reduced ? "none" : `translateY(${(1 - paraIn) * 24 - paraOut * 90}px)`);

const reveal = range(p, 0.24, 0.56);
words.forEach((word, i) => {
  const lit = clamp01((reveal * (words.length + 3) - i) / 3);
  word.style.opacity = String((0.16 + 0.84 * lit) * (1 - 0.6 * paraDim));
});

const mockIn = easeOut(range(p, 0.83, 0.97));
setLayer(mock, mockIn, reduced ? "none" : `translateY(${(1 - mockIn) * 160}px)`);
```

### Loop lifecycle

- One `requestAnimationFrame` loop reads the stage rect and calls `render` every frame (the ring rotates and tiles drift even without scrolling).
- An `IntersectionObserver` on the stage pauses the loop when the stage is off-screen and resumes it when it returns.
- Clean up the rAF, `ResizeObserver`, and `IntersectionObserver` on unmount.
- Render the paragraph as `words.map` → `<span><span ref class="word">{word}</span>{" "}</span>`, collecting refs in an array via ref callbacks.

## Chat preview (`LessonMock.tsx`)

A `<figure>` (`width: min(100%, 56rem)`) containing an `aria-hidden` window and an sr-only `<figcaption>`: "Preview of an Arix lesson: the English tutor Inès asks about your weekend, you answer in English, and she suggests a more natural phrasing."

Window: white, `1px solid var(--line)`, radius 1.25rem, shadow `0 1px 2px rgb(30 20 10 / 0.04), 0 24px 60px -24px rgb(30 20 10 / 0.18)`. Grid of one column on mobile, `15rem 1fr` at ≥720px.

- **Sidebar** (≥720px only): background `#fbfbfa`, right hairline, label "Your tutors" (12px muted). Four rows (36px avatar with radius 10px, `object-position: 50% 30%`; name 14px/500; topic 12px muted, ellipsis):
  - Inès · English · Weekend plans (tutor-02, active row with `rgb(17 17 17 / 0.05)` background)
  - Kenji · Japanese · Ordering food (tutor-04)
  - Lucía · Spanish · Past tense (tutor-09)
  - Mina · Korean · Small talk (tutor-11)
- **Chat header**: avatar (tutor-02), "Inès" 15px/600, "English tutor · Lesson 14" 12px muted, bottom hairline.
- **Messages** (gap 0.625rem, padding 1.25rem; bubbles max 85% width, radius 1rem, 14px, line-height 1.45):
  - Tutor (left, `#f2f1ef`, bottom-left radius 6px): "Let’s begin! Tell me about your weekend, in English this time."
  - Learner (right, `--cta` background, white text, bottom-right radius 6px): "On Saturday, I went to the market with my sister."
  - Tutor note (left, `#eef8f5` with `1px solid #cfe9e2`): label "Nice work" (12px/600, `#1f6d5f`), then "“I went” is spot on. Add a time to sound natural: *on Saturday morning*."
- **Composer**: pill outline with "Write in English…" (muted) plus a mic icon and a dark circular send button.

## Page shell (`app/page.tsx`)

```tsx
<>
  <a href="#main" className="skip-link">Skip to content</a>
  <SiteHeader />
  <main id="main" tabIndex={-1}>
    <div id="top" />
    <HeroSequence />
  </main>
  <footer className="site-footer">
    <p>© 2026 Arix</p>
    <p>Made by <a href="https://x.com/athrix_codes" target="_blank" rel="noopener noreferrer">https://x.com/athrix_codes</a></p>
  </footer>
</>
```

`app/layout.tsx`: `<html lang="en" className={inter.variable}>`, the metadata above, and `export const viewport = { themeColor: "#f6f6f6" }`.

## Accessibility and quality rules

- Semantic landmarks: header, nav (`aria-label="Primary"` and `"Mobile"`), main, section with `aria-labelledby`, footer. One `h1`.
- Every interactive element is a real `<a>` or `<button>` with a visible focus ring and at least a 40px hit area (44px on touch).
- Decorative imagery (tiles, chat avatars, icons) uses `alt=""` or `aria-hidden`. Meaning carried by icons gets sr-only text.
- Hover effects only inside `@media (hover: hover) and (pointer: fine)`. Never use `transition: all`.
- Animate only `transform` and `opacity`, and write them directly to element styles.
- `prefers-reduced-motion`: follow the reduced path above. No rotation, drift, travel, or fly-through; everything stays readable.
- No horizontal overflow at 320px width. Tiles and text must not collide at 390×844, 1440×830, or 1920×1080.
- No emoji anywhere.

## Deployment

- No `vercel.json` and no environment variables are needed. Vercel auto-detects Next.js (build `npm run build`, output managed by Next).
- Write a `README.md` with a "Deploy with Vercel" button:
  `[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAtharvsinh-codez%2Fhero-section-os)`
  It also needs local run steps (`npm install`, `npm run dev`), a scripts table, and the project structure.

## Verification checklist (do all before finishing)

1. `npm run lint` and `npm run build` both pass with no errors.
2. Run the production server and capture screenshots at p = 0, 0.16, 0.4, 0.6, 0.76, 0.84, 1.0 at 1440×830 and 390×844:
   - p=0: complete ring, headline fully inside it, CTA and "Practice on" visible, "Learn in" strip at the bottom.
   - p≈0.16: tiles clustered slightly below centre, hero text gone.
   - p≈0.4: scattered tiles at varied sizes; paragraph half black, half gray.
   - p≈0.6: all words black; tiles drifting.
   - p≈0.76: tiles large and moving outward; paragraph dimmed.
   - p≈0.84: paragraph nearly gone; chat rising and **not overlapping** the paragraph.
   - p=1: chat centred and fully visible.
3. On mobile, the headline must not touch any ring tile, and the menu must open, close with Escape, and return focus.
4. With reduced motion enabled, nothing travels or rotates, and all content still appears.
5. The header brand link opens the Factory URL in a new tab; the footer link opens the X profile.

A hydration warning listing attributes like `bis_skin_checked` or `bis_register` comes from a browser extension injecting them into the page, not from the app. Confirm in an incognito window instead of suppressing it in code.
````
