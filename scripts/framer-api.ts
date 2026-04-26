import "dotenv/config";
import fs from "fs/promises";
import { connect } from "framer-api";

const projectUrl = process.env.FRAMER_PROJECT_URL;
const apiKey = process.env.FRAMER_API_KEY;

const OUTPUT_FILE = "./scripts/out/projects.json";

const FIELD_NAMES = [
  "Project title",
  "Slug",
  "Client",
  "Year",
  "Overview",
  "Details",
  "Brief description",
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

    const fieldItem = await getFieldItem(projectsCollection, FIELD_NAMES[0]);
    console.log([fieldItem]);
    const projectTitleFieldItem = fieldItem;

    const fieldItems = await getFieldItems(projectsCollection, FIELD_NAMES);
    console.log(fieldItems);
    
    // Get all items
    const allItems = await projectsCollection.getItems();

    console.log(`Total Items: ${allItems.length}`);
    console.log(allItems[0]);

    let itemsToSave = allItems;

    // // First 10 only
    // const firstTen = allItems.slice(0, 10);
    // itemsToSave = firstTen;

    // Keep selected fields only
    const cleaned = itemsToSave.map((item) => {
      const row: Record<string, any> = {};
      
      row[projectTitleFieldItem.name] = item.fieldData[projectTitleFieldItem.id].value ?? null;

      // for (const field of FIELD_NAMES) {
      //   row[field] = item[field] ?? null;
      // }

      return row;
    });

    // Save locally
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(cleaned, null, 2),
      "utf-8"
    );

    // console.log(`Saved ${cleaned.length} items to ${OUTPUT_FILE}`);
  } finally {
    await framer.disconnect();
  }
};

void (async () => {
  await callFramerApi();
})();