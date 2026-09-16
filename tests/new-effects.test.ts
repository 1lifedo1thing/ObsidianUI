import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { buildRegistry } from "../scripts/registry";
import { newEffects } from "../src/components/catalog/new-effects";
import { effectExamples } from "../src/components/catalog/effect-examples";
import navigation from "../src/content/_meta";

test("new effects have discoverable docs, complete copyable source, and self-contained install packages", () => {
    const root = process.cwd();
    const registry = buildRegistry(root);
    const installed = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).dependencies;
    assert.equal(new Set(newEffects.map(effect => effect.slug)).size, 23);
    for (const effect of newEffects) {
        assert.equal(navigation[effect.slug], effect.title);
        const item = registry.items.find(item => item.name === effect.slug);
        assert.ok(item, `Missing install package for ${effect.slug}`);
        assert.ok(item.files.some(file => file.path === `components/block/${effect.slug}.jsx`));
        for (const dependency of item.dependencies) assert.ok(installed[dependency], `${effect.slug} needs ${dependency}`);
        const markdown = fs.readFileSync(path.join(root, "src/content", `${effect.slug}.mdx`), "utf8").replace(/\r\n/g, "\n");
        assert.ok(markdown.includes(`<CLICommand componentName="${effect.slug}" />`));
        assert.ok(markdown.includes(`<EffectPreview slug="${effect.slug}" />`));
        assert.ok(markdown.includes(effectExamples[effect.slug]));
        for (const file of item.files) {
            assert.ok(file.content.trim(), `${file.path} is empty`);
            assert.ok(markdown.includes(`>${file.path}</code>`), `Missing destination for ${file.path}`);
            assert.ok(markdown.includes(`\n${file.content.trim()}\n\`\`\``), `Incomplete source for ${file.path}`);
        }
        assert.doesNotMatch(markdown, /web-vault|montra|regem|seorun/i);
        for (const asset of item.meta?.remoteAssets ?? []) {
            const url = new URL(asset);
            assert.equal(url.origin, "https://www.obsidianui.dev");
            assert.ok(fs.statSync(path.join(root, "public", decodeURIComponent(url.pathname))).size > 0, `Missing demo asset ${asset}`);
        }
    }
});


test("keeps the selected effects and excludes removed components", () => {
    const selected = ["draggable-marquee","parallax-gallery","scroll-stack","svg-path-marquee","svg-pixel-reveal","butterfly-trail-cursor","colorful-cursor-aura","interactive-arrows","rope-cursor","book-flip","curved-plane","fractal-glass","grid-lift","interactive-hover-slider","art-gallery"];
    const existing = ["magnetic-image-trail", "arrow-fill-button", "dotted-grid", "interactive-blur-reveal", "text-fill-animation", "rectangular-text-reveal", "text-stream", "dither-canvas"];
    assert.deepEqual(newEffects.map(effect => effect.slug).sort(), [...selected, ...existing].sort());
    const registry = buildRegistry(process.cwd());
    for (const slug of ["photo-gallery", "inertia-img", "liquid-glass-cursor", "staggered-grid", "depth-card-stack", "animated-modal", "animated-faq", "animated-tabs", "testimonial-swiper"]) {
        assert.ok(!registry.items.some(item => item.name === slug), slug);
        assert.ok(!(slug in navigation), slug);
        for (const file of [`src/content/${slug}.mdx`, `src/components/block/${slug}.jsx`, `src/components/block/${slug}.tsx`, `public/r/${slug}.json`]) assert.ok(!fs.existsSync(file), file);
    }
    for (const file of ["src/lib/effects/animated-faq/chevron-bird.jsx", "public/effects/testimonial-swiper", "public/effects/inertia-img", "public/avatars"]) {
        assert.ok(!fs.existsSync(file), `Removed component support remains: ${file}`);
    }
});
