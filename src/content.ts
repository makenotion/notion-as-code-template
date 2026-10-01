/** Markdown content for the welcome page. Imported by main.ts to show that
 * scripts can span multiple files — `npm run build` bundles them. */
export const welcomeContent = `# Welcome

This page was created by Notion-as-Code. Edit src/main.ts and re-run
\`ntn notion-as-code apply .\` to update it.

<callout icon="💡" color="blue_bg">
Start with <mention url="sample-projects-ds" type="data-source">Sample Projects</mention>.

- Update the sample rows in src/data/sample-projects.json.
- Keep resource IDs stable when re-applying.
</callout>

> This is a quote block.

---

This is a bulleted list:
- Item 1
- Item 2
- Item 3
`;
