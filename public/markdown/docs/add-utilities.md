# ObsidianUI — Add utilities

[Canonical page](https://www.obsidianui.dev/docs/add-utilities) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

Set up utility functions for Obsidian UI components.

***

## Create cn Helper

Create a `cn` helper function in your utilities file (`lib/utils.ts` or `src/lib/utils.ts`):

```typescript
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs));
}
```

## Install Dependencies

Install the required packages:

```bash
npm install motion clsx tailwind-merge lucide-react
```

This utility combines Tailwind CSS classes intelligently, handling conflicts and duplicates automatically.
