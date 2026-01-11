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

const files = fs
  .readdirSync(rawDataDir)
  .filter((file) => file.endsWith(".csv"));

console.log("CSV files found:");
files.forEach((file) => console.log(" -", file));