import "dotenv/config";
import axios from "axios";

const apiBaseUrl = process.env.FRAMER_API_BASE_URL ?? "https://api.framer.com";
const endpoint = process.env.FRAMER_ENDPOINT ?? "/v1/projects";
const apiToken = process.env.FRAMER_API_TOKEN ?? "dummy_token_123";

const callFramerApi = async (): Promise<void> => {
  const url = `${apiBaseUrl}${endpoint}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    console.log("Framer API call succeeded.");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Framer API call failed.");
      console.error("Status:", error.response?.status ?? "No status");
      console.error("Response:", error.response?.data ?? error.message);
      return;
    }

    console.error("Unexpected error during Framer API call:", error);
  }
};

void (async () => {
  await callFramerApi();
})();
