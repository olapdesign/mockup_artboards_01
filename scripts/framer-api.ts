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
  } finally {
    // Close down the server API so the script can exit cleanly.
    await framer.disconnect();
  }
};

void (async () => {
  await callFramerApi();
})();
