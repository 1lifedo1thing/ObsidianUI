# ObsidianUI MCP Server Documentation

Connect a local coding agent to ObsidianUI component resources through the repository's stdio MCP server.

## Run the local MCP server

The repository includes an MCP server in scripts/mcp-server.ts. It uses stdio transport and exposes read-only resources. This documentation URL is not a hosted HTTP MCP endpoint.

Clone the repository, install its dependencies, and generate the component registry. Configure your MCP client to launch npm run mcp with this checkout as its working directory.

```bash
git clone https://github.com/Atharvsinh-codez/ObsidianUI.git
cd ObsidianUI
npm ci
npm run registry:build
npm run mcp
```

[MCP server source](https://github.com/Atharvsinh-codez/ObsidianUI/blob/main/scripts/mcp-server.ts)

## Read component resources

Use MCP resources/list to discover available components. Then use resources/read with a returned URI, such as obsidian://hover-img. The resource returns the same application/json registry item used by HTTP installation, including all source and supporting files.

The server exposes resources, not code-execution or file-writing tools. Your coding agent applies the downloaded files in your project with your normal approval and review settings.

[HTTP registry alternative](https://www.obsidianui.dev/r/registry.json)

[Agent installation instructions](https://www.obsidianui.dev/agent-instructions.md)
