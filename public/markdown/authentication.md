# ObsidianUI Authentication Documentation

Public component downloads and documentation require no authentication.

## Public access

Read the registry, Markdown documentation, llms.txt, and OpenAPI specification with ordinary HTTPS GET requests. No API key, account, bearer token, session cookie, or login flow is required.

Use a descriptive User-Agent and fetch only the files needed for the current task. Cache unchanged downloads locally. If a deployed edge service returns 403, report the URL and response headers to the maintainer rather than attempting to bypass the restriction.

[API documentation](https://www.obsidianui.dev/api)

[Crawler policy](https://www.obsidianui.dev/robots.txt)

## Authentication in your application

Copying a UI component does not add authentication or a backend to your application. If an example needs an application API, provide and secure that endpoint yourself. Never put secret keys into client component files or registry content.

[Installation guide](https://www.obsidianui.dev/docs/installation)
