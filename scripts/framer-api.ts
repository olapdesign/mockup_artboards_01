import "dotenv/config";
import fs from "fs/promises";
import { connect, ImageAsset } from "framer-api";

const projectUrl = process.env.FRAMER_PROJECT_URL;
const apiKey = process.env.FRAMER_API_KEY;

const OUTPUT_FILE = "./scripts/out/projects.json";

const FIELD_NAMES = [
  "Project title",
  "Client",
  "Year",
  "Overview",
  "Details",
  "Brief description",
  "Preview Image",
  "Gallery",
  "Main video URL",
  "Categories"
];

const getFieldItem = async (collection: any, fieldName: string): Promise<any> => {
  const fieldItems = await collection.getFields();
  return fieldItems.find((field) => field.name.toLowerCase() === fieldName.toLowerCase());
};

const getFieldItems = async (collection: any, fields: any[]): Promise<any[]> => {
  const fieldItems = await collection.getFields();
  return fieldItems.filter((field) => fields.includes(field.name.toLowerCase()));
};

const callFramerApi = async (): Promise<void> => {
  if (!projectUrl) {
    throw new Error("Missing FRAMER_PROJECT_URL in environment.");
  }

  if (!apiKey) {
    throw new Error("Missing FRAMER_API_KEY in environment.");
  }

  const framer = await connect(projectUrl, apiKey);

  try {
    const projectInfo = await framer.getProjectInfo();

    console.log(`Project: ${projectInfo.name}`);

    // Get all CMS collections
    const collections = await framer.getCollections();

    // Find "Projects" collection
    const projectsCollection = collections.find(
      (collection) => collection.name === "Projects"
    );

    if (!projectsCollection) {
      throw new Error('CMS collection "Projects" not found.');
    }

    const fieldItems: any[] = [];
    for (const fieldName of FIELD_NAMES) {
      const fieldItem = await getFieldItem(projectsCollection, fieldName);
      fieldItems.push(fieldItem);
    }

    // Get all items
    const allItems = await projectsCollection.getItems();

    console.log(`Total Items: ${allItems.length}`);

    let itemsToSave = allItems;

    const previewImageFieldItem = fieldItems.find((field) => field.name === "Preview Image");
    const mainVideoFieldItem = fieldItems.find((field) => field.name === "Main video URL");
    const galleryFieldItem = fieldItems.find((field) => field.name === "Gallery");
    const categoriesFieldItem = fieldItems.find((field) => field.name === "Categories");

    // Published only
    const publishedItems = allItems.filter((item) => item.draft !== true);
    itemsToSave = publishedItems;

    console.log(fieldItems);
    console.log(galleryFieldItem);

    // Keep selected fields only
    const cleaned = itemsToSave.map((item) => {
      const row: Record<string, any> = {};

      for (const fieldItem of fieldItems) {
        row[fieldItem.name] = item.fieldData[fieldItem.id]?.value ?? null;
      }

      const previewImageObj = item.fieldData[previewImageFieldItem?.id]?.value;
      const mainVideoObj = item.fieldData[mainVideoFieldItem?.id]?.value;
      const galleryObj = item.fieldData[galleryFieldItem?.id]?.value;
      const categoriesObj = item.fieldData[categoriesFieldItem?.id]?.value;

      const firstGalleryImage =
        Array.isArray(galleryObj) && galleryObj.length > 0
          ? (galleryObj[0] as any)?.url ?? null
          : (galleryObj as any)?.url ?? null;

      row["slug"] = item.slug;
      row["Preview Image"] = (previewImageObj as any)?.url ?? null;
      row["Gallery"] = firstGalleryImage;
      row["Main video URL"] = mainVideoObj ?? null;
      row["Categories"] = categoriesObj ?? [];

      return row;
    });

    // Save locally
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(cleaned, null, 2),
      "utf-8"
    );

  } finally {
    await framer.disconnect();
  }
};

void (async () => {
  await callFramerApi();
})();