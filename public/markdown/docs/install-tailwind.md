# ObsidianUI — Install Tailwind CSS

[Canonical page](https://www.obsidianui.dev/docs/install-tailwind) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

Configure Tailwind CSS in your Next.js project.

***

## Install Packages

If you already have a Next.js project without Tailwind CSS, install it:

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

## Configure PostCSS

Create or update your `postcss.config.mjs` file:

```javascript
export default {
plugins: {
  "@tailwindcss/postcss": {},
},
};
```

## Add CSS Import

Add the Tailwind CSS import to your global CSS file (`src/app/globals.css`):

```css
@import "tailwindcss";
```
