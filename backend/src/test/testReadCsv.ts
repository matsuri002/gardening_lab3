import "dotenv/config";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

const ONEDRIVE_ROOT = process.env.ONEDRIVE_ROOT;
if (!ONEDRIVE_ROOT) {
  throw new Error("ONEDRIVE_ROOT is not defined");
}

const csvFilePath = path.join(
  ONEDRIVE_ROOT,
  "gardening_lab",
  "komatsuna",
  "komatsuna_A",
  "raw_data",
  "komatsuna_A_2025-12-08.csv",
);

console.log("CSV PATH =", csvFilePath);

type CsvRow = {
  date?: string;
  time?: string;
  temperature?: string;
  humidity?: string;
  soil_moisture?: string;
};

async function readCsv() {
  const results: CsvRow[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data: CsvRow) => results.push(data))
      .on("end", () => {
        console.log("✅ CSV読み込み完了");
        console.log("件数:", results.length);
        console.log("先頭データ:", results[0]);
        resolve();
      })
      .on("error", reject);
  });
}

readCsv().catch(console.error);
