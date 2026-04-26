import "dotenv/config";
import { connect } from "framer-api";

const projectUrl = process.env.FRAMER_PROJECT_URL;
const apiKey = process.env.FRAMER_API_KEY;

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
    console.log(projectInfo);

    // Get all CMS collections
    const collections = await framer.getCollections();

    // Find collection named "Categories"
    const categoriesCollection = collections.find(
      (collection) => collection.name === "Categories"
    );

    if (!categoriesCollection) {
      console.log('CMS collection "Categories" not found.');
      return;
    }

    // Get all items in the collection
    const items = await categoriesCollection.getItems();

    console.log(`Collection: ${categoriesCollection.name}`);
    console.log(`Total Items: ${items.length}`);
  } finally {
    // Close connection cleanly
    await framer.disconnect();
  }
};

void (async () => {
  await callFramerApi();
})();