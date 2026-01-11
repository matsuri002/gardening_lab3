import "dotenv/config";
import fs from "fs";
import path from "path";
import { supabase } from "../lib/supabase.js";
import csv from "csv-parser";

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

// supabaseのplantsテーブルから指定した植物名に対応するidを1件取得する
async function getPlantId(plantName: string): Promise<string> {
  const { data, error } = await supabase
    .from("plants")
    .select("id")
    .eq("plant_name", plantName)
    .single();

  if (error || !data) {
    throw new Error(`plant_id が取得できません: ${plantName}`);
  }

  return data.id;
}

// supabaseのdaily_environmentテーブルに1日の環境データをINSERTする
async function insertDailyEnvironment(
  plantId: string,
  date: string,
  sourceCsvPath: string
) {
  const { error } = await supabase.from("daily_environment").insert({
    plant_id: plantId,
    date,
    source_csv_path: sourceCsvPath,
  });

  if (error) {
    throw error;
  }
}

// 指定したcsvファイルの行数をストリームで数えて返す
async function readCsvAndCountRows(csvFilePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let count = 0;

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", () => {
        count++;
      })
      .on("end", () => {
        resolve(count);
      })
      .on("error", reject);
  });
}

// 列挙と判定
async function main() {
  const plantName = "komatsuna_A";

  const plantId = await getPlantId(plantName);
  console.log("plant_id =", plantId);

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
      console.log(`SKIP（登録済み）: ${file}`);
      continue;
    }

    const fullCsvPath = path.join(rawDataDir, file);

    // csvが読めるか確認
    const rowCount = await readCsvAndCountRows(fullCsvPath);
    console.log(`${file} 行数=${rowCount}`);

    // DB に INSERT
    await insertDailyEnvironment(plantId, date, sourceCsvPath);
    console.log(`INSERT 完了: ${file}`);
  }
}

main().catch(console.error);
