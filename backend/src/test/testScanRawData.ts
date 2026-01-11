import "dotenv/config";
import fs from "fs";
import path from "path";

const ONEDRIVE_ROOT = process.env.ONEDRIVE_ROOT;
if (!ONEDRIVE_ROOT) {
  throw new Error("ONEDRIVE_ROOT is not defined");
}

const rawDataDir = path.join(
  ONEDRIVE_ROOT,
  "gardening_lab",
  "komatsuna",
  "komatsuna_A",
  "raw_data"
);

// CSV名から日付を取り出す関数
function extractDateFromFilename(filename: string): string {
  const match = filename.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) {
    throw new Error(`日付が含まれていないCSV名: ${filename}`);
  }
  return match[0];
}

// raw_data を走査
const files = fs
  .readdirSync(rawDataDir)
  .filter((file) => file.endsWith(".csv"));

files.forEach((file) => {
  const date = extractDateFromFilename(file);
  console.log(`${file} → ${date}`);
});
