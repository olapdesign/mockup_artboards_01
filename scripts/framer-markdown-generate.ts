import "dotenv/config";
import fs from "fs/promises";

const INPUT_FILE = "./scripts/out/projects.json";
const OUTPUT_FILE = "./scripts/out/report/index.md";

const buildProjectMarkdown = (item: any): string => {
  const categories = Array.isArray(item["Categories"])
    ? item["Categories"].join(", ")
    : "";

  return `## ${item["Project title"]}

![](${item["Preview Image"]})

**Slug:** ${item["slug"]}
**Client:** ${item["Client"]}
**Year:** ${item["Year"]}
**Categories:** ${categories}

**Brief Description:** ${item["Brief description"]}

**Overview:**  
${item["Overview"]}

**Details:**  
${item["Details"]}

**Preview Image:**  
${item["Preview Image"]}

**Main Video URL:**  
${item["Main video URL"]}

---

`;
};

const run = async (): Promise<void> => {
  const raw = await fs.readFile(INPUT_FILE, "utf-8");
  const projects = JSON.parse(raw);

  if (!Array.isArray(projects)) {
    throw new Error("projects.json must contain an array.");
  }

  await fs.mkdir("./scripts/out/report", { recursive: true });

  let markdown = `# Projects Report

Total Projects: ${projects.length}

---

`;

  for (const item of projects) {
    markdown += buildProjectMarkdown(item);
  }

  await fs.writeFile(OUTPUT_FILE, markdown, "utf-8");

  console.log(`Saved report to ${OUTPUT_FILE}`);
};

void (async () => {
  await run();
})();