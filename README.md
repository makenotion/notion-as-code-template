# Notion-as-Code project

Notion-as-Code lets you describe Notion workspace structure — teamspaces,
pages, databases, and entries — as TypeScript, then apply it with the Notion
CLI. Re-applying updates the same resources instead of creating duplicates.

> **Alpha:** Notion-as-Code is experimental and not publicly available; the
> API may reject requests in some environments.

## Prerequisites

- The Notion CLI (`ntn`)
- `ntn login` (once per workspace)

## Quick start

```sh
npm install
ntn notion-as-code apply .
```

Then edit `src/main.ts` (and the files it imports) and re-run
`ntn notion-as-code apply .` to update the same resources.

You can also install and build with PNPM 11:

```sh
pnpm install
pnpm run build
ntn notion-as-code apply .
```

The PNPM config allows only esbuild to run its install script, so it does not
need a manual build approval. The build script works with both npm and PNPM.
Using PNPM without npm also requires a version of `ntn` that supports PNPM.

See [AGENTS.md](./AGENTS.md) for the full authoring guide.
