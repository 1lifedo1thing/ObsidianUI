import fs from 'node:fs';
import path from 'node:path';
import { COMPONENT_NAME, isWithin, type Registry } from './registry';

export function readRegistryCatalog(projectRoot: string): Registry {
    const directory = fs.realpathSync(path.join(projectRoot, 'public/r'));
    const filename = fs.realpathSync(path.join(directory, 'registry.json'));
    if (!isWithin(fs.realpathSync(projectRoot), directory) || !isWithin(directory, filename)) throw new Error('Registry catalog must stay inside the project registry directory.');
    const catalog: unknown = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (!catalog || typeof catalog !== 'object' || !('items' in catalog) || !Array.isArray(catalog.items) ||
        !catalog.items.every(item => item && typeof item.name === 'string' && COMPONENT_NAME.test(item.name))) {
        throw new Error('Invalid registry catalog. Run npm run registry:build.');
    }
    return catalog as Registry;
}

export function readRegistryResource(projectRoot: string, uri: string): string {
    const match = /^obsidian:\/\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(uri);
    if (!match) throw new Error('Expected an obsidian://component-name resource URI.');
    const name = match[1];
    if (!readRegistryCatalog(projectRoot).items.some(item => item.name === name)) throw new Error(`Unknown component: ${name}`);
    const directory = fs.realpathSync(path.join(projectRoot, 'public/r'));
    const filename = fs.realpathSync(path.join(directory, `${name}.json`));
    if (!isWithin(directory, filename)) throw new Error('Component resource must stay inside the registry directory.');
    return fs.readFileSync(filename, 'utf8');
}
