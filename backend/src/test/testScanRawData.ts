import "dotenv/config";
import fs from "fs";
import path from "path";
import { supabase } from "../lib/supabase.js";

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

const PLANT_ID = "dummy-uuid-a"; // 将来的にplantsテーブルから取得する

// CSV名から日付を取り出す関数
function extractDateFromFilename(filename: string): string {
  const match = filename.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) {
    throw new Error(`日付が含まれていないCSV名: ${filename}`);
  }
  return match[0];
}

// 取り込み済判定
async function isCsvAlreadyImported(sourceCsvPath: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("daily_environment")
    .select("id")
    .eq("source_csv_path", sourceCsvPath)
    .limit(1);

  if (error) {
    throw error;
  }

  return data.length > 0;
}

// 列挙と判定
async function main() {
  const files = fs
    .readdirSync(rawDataDir)
    .filter((file) => file.endsWith(".csv"));

  for (const file of files) {
    const date = extractDateFromFilename(file);

    const sourceCsvPath = path.join(
      "gardening_lab",
      "komatsuna",
      "komatsuna_A",
      "raw_data",
      file
    );

    const alreadyImported = await isCsvAlreadyImported(sourceCsvPath);

    if (alreadyImported) {
      console.log(`SKIP（登録済）: ${file}`);
    } else {
      console.log(`NEW（未登録）: ${file} / ${date}`);
    }
  }
}

main().catch(console.error);
