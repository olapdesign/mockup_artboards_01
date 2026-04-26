import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import axios from "axios";

const inputDir = process.argv[2];
const briaApiToken = process.env.BRIA_API_TOKEN;

const removeBackgrounds = async (): Promise<void> => {
  if (!inputDir) {
    throw new Error("Usage: node remove-bg.js <input-folder>");
  }

  if (!briaApiToken) {
    throw new Error("Missing BRIA_API_TOKEN in environment.");
  }

  const outputDir = path.join(path.dirname(inputDir), "out");
  fs.mkdirSync(outputDir, { recursive: true });

  const files = fs
    .readdirSync(inputDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  for (const file of files) {
    try {
      console.log(`Processing ${file}...`);

      const filePath = path.join(inputDir, file);
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);

      const imageBuffer = fs.readFileSync(filePath);
      const mimeType = ext === ".png" ? "image/png" : "image/jpeg";
      const imageBase64 = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

      const response = await axios.post(
        "https://engine.prod.bria-api.com/v2/image/edit/remove_background",
        {
          image: imageBase64,
          sync: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            api_token: briaApiToken,
          },
        },
      );

      const resultUrl = response.data.result?.image_url ?? response.data.image_url;

      if (!resultUrl) {
        throw new Error(
          `No result URL returned:\n${JSON.stringify(response.data, null, 2)}`,
        );
      }

      const result = await axios.get<ArrayBuffer>(resultUrl, {
        responseType: "arraybuffer",
      });

      const outPath = path.join(outputDir, `${baseName}_bgremoved.png`);
      fs.writeFileSync(outPath, Buffer.from(result.data));

      console.log(`Saved ${outPath}`);
    } catch (error) {
      console.error(`Failed: ${file}`);
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  }
};

void (async () => {
  await removeBackgrounds();
})();
