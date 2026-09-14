# ObsidianUI — CLI

[Canonical page](https://www.obsidianui.dev/docs/cli) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

## MCP Server

The shadcn MCP Server allows AI assistants to interact with items from registries. You can browse available components, search for specific ones, and install them directly into your project using natural language.

### Configuration

Add the Obsidian UI registry to your project's `components.json` file.

```json
{
"registries": {
  "@obsidian": "https://www.obsidianui.dev/r/{name}.json"
}
}
```

### Initialization

Add the MCP server to your project:

```bash
npx shadcn@latest mcp init
```

### Client Setup

Configure for your AI assistant (e.g., Cursor):

```bash
npx shadcn@latest mcp init --client cursor
```
