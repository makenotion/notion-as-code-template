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

## Markdown content

Page `content` and custom-agent `instructions` use Notion Markdown vNext.
The full reference is the generated `NotionAsCodeMarkdownSpec` type in
[`src/lib/types.d.ts`](./src/lib/types.d.ts). The welcome page shows a callout
with an inline data-source mention:

```text
<callout icon="💡" color="blue_bg">
Start with <mention url="sample-projects-ds" type="data-source">Sample Projects</mention>.

- Keep resource IDs stable when re-applying.
</callout>
```

Use `<mention url="resource-id">Label</mention>` instead of legacy
`<mention-page>` tags. Bare resource IDs and existing `{{resource-id}}`
placeholders are both supported. Use `type="database"`, `type="data-source"`,
or `type="agent"` when referencing that resource kind. External URLs use
ordinary `[text](https://example.com)` links, not resource mentions.

Container titles go in their bodies, with a blank line before children;
media tags use `source` rather than `src`. The server rejects malformed
Markdown and unknown or mistyped references during apply. `npm run build`
records intents without validating or applying their Markdown.

See [AGENTS.md](./AGENTS.md) for the full authoring guide.
