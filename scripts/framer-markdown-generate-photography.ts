import "dotenv/config";
import fs from "fs/promises";

const INPUT_FILE = "./scripts/out/photography_projects.json";
const OUTPUT_FILE = "./scripts/out/report/photography_projects.md";

const buildGalleryImages = (gallery: unknown): string => {
  if (!Array.isArray(gallery) || gallery.length === 0) {
    return "";
  }

  const urls = gallery.filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0
  );

  if (urls.length === 0) {
    return "";
  }

  return urls.map((url) => `![](${url})`).join("\n\n");
};

const buildProjectMarkdown = (item: any): string => {
  const categories = Array.isArray(item["Categories"])
    ? item["Categories"].join(", ")
    : "";
  const galleryImages = buildGalleryImages(item["Gallery"]);

  return `## ${item["Project title"]}

${galleryImages}

**Slug:** ${item["slug"]}
**Client:** ${item["Client"]}
**Year:** ${item["Year"]}
**Categories:** ${categories}

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

  for (const item of projects.reverse()) {
    markdown += buildProjectMarkdown(item);
  }

  await fs.writeFile(OUTPUT_FILE, markdown, "utf-8");

  console.log(`Saved report to ${OUTPUT_FILE}`);
};

void (async () => {
  await run();
})();