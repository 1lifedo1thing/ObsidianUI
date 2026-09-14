import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { openapi } from "../src/lib/agent/openapi";
import { developerResources } from "../src/lib/agent/developer-resources";
import { GET } from "../src/app/openapi.json/route";

test("OpenAPI publishes the public unauthenticated component API with resolvable references and path parameters", () => {
  assert.equal(openapi.openapi, "3.1.1");
  assert.deepEqual(openapi.security, []);
  const operations = new Set();
  for (const [route, methods] of Object.entries(openapi.paths)) {
    const get = methods.get;
    assert.ok(!operations.has(get.operationId));
    operations.add(get.operationId);
    for (const match of route.matchAll(/\{([^}]+)\}/g)) {
      assert.ok("parameters" in get && get.parameters.some(param => param.name === match[1] && param.in === "path" && param.required));
    }
    assert.ok(get.responses["200"], route);
  }
  for (const match of JSON.stringify(openapi).matchAll(/"\$ref":"#\/components\/schemas\/([^"]+)"/g)) {
    assert.ok(Object.hasOwn(openapi.components.schemas, match[1]), match[1]);
  }
  assert.ok(!Object.hasOwn(openapi.paths, "/mcp"), "stdio MCP must not be advertised as HTTP");
});

test("registry downloads satisfy the required documented fields and include nonempty file content", () => {
  const registry = JSON.parse(readFileSync("public/r/registry.json", "utf8"));
  for (const key of openapi.components.schemas.Registry.required) assert.ok(Object.hasOwn(registry, key));
  assert.ok(registry.items.length > 0);
  for (const item of registry.items) {
    for (const key of openapi.components.schemas.RegistryItem.required) assert.ok(Object.hasOwn(item, key), `${item.name}.${key}`);
    assert.ok(Array.isArray(item.dependencies));
    assert.ok(item.files.length > 0);
    for (const file of item.files) {
      for (const key of openapi.components.schemas.RegistryFile.required) assert.equal(typeof file[key], "string");
      assert.ok(file.content.trim());
    }
  }
});

test("the specification endpoint is JSON, browser-readable and advertises agent discovery", async () => {
  const response = GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type")!, /application\/json/);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.match(response.headers.get("link")!, /\/llms.txt/);
  assert.deepEqual(await response.json(), openapi);
});

test("developer resources describe actual access and MCP capabilities with branded names", () => {
  assert.deepEqual(Object.keys(developerResources), ["/developers", "/api", "/authentication", "/mcp"]);
  for (const page of Object.values(developerResources)) {
    assert.match(page.title, /^ObsidianUI /);
    assert.ok(page.description.length > 50);
    assert.ok(page.sections.length >= 2);
    for (const section of page.sections) {
      assert.ok(section.title);
      for (const link of section.links ?? []) assert.match(link.href, /^(\/|https:\/\/)/);
    }
  }
  assert.match(JSON.stringify(developerResources["/mcp"]), /not a hosted HTTP MCP endpoint/);
  assert.match(developerResources["/authentication"].description, /no authentication/);
});
