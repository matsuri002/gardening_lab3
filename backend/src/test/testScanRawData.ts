import "dotenv/config";
import fs from "fs";
import path from "path";
import { supabase } from "../lib/supabase.js";
import csv from "csv-parser";
import { extractDateFromCsv } from "../lib/parseCsvFilename.js";
import { readCsvRows } from "../lib/readCsv.js";
import { insertEnvironmentMeasurements } from "../lib/insertEnvironmentMeasurements.js";

const ONEDRIVE_ROOT = process.env.ONEDRIVE_ROOT;
if (!ONEDRIVE_ROOT) {
  throw new Error("ONEDRIVE_ROOT is not defined");
}
const ONEDRIVE_ROOT_PATH: string = ONEDRIVE_ROOT;

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

// supabaseのdaily_environmentテーブルに1日の環境データをUPSERTする
async function upsertDailyEnvironment(plantId: string, date: string, sourceCsvPath: string) {
  const { error } = await supabase.from("daily_environment").upsert(
    {
      plant_id: plantId,
      date,
      source_csv_path: sourceCsvPath,
    },
    {
      onConflict: "plant_id,date",
    },
  );

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
  const targets = ["komatsuna_A", "komatsuna_B", "komatsuna_C"];

  for (const plantName of targets) {
    console.log(`=== start: ${plantName} ===`);

    const plantId = await getPlantId(plantName);
    console.log("plant_id =", plantId);

    const rawDataDir = path.join(
      ONEDRIVE_ROOT_PATH,
      "gardening_lab",
      "komatsuna",
      plantName,
      "raw_data",
    );

    if (!fs.existsSync(rawDataDir)) {
      console.warn(`raw_data が存在しません: ${rawDataDir}`);
      continue;
    }

    const files = fs.readdirSync(rawDataDir).filter((file) => file.endsWith(".csv"));

    for (const file of files) {
      const csvDate = extractDateFromCsv(file);

      const fullCsvPath = path.join(rawDataDir, file);

      // csvが読めるか確認
      const rowCount = await readCsvAndCountRows(fullCsvPath);
      console.log(`${plantName} ${file} 行数=${rowCount}`);

      const rows = await readCsvRows(fullCsvPath);

      await insertEnvironmentMeasurements(plantId, rows);

      // DB に UPSERT
      await upsertDailyEnvironment(
        plantId,
        csvDate,
        path.join("gardening_lab", "komatsuna", plantName, "raw_data", file),
      );
    }

    console.log(`=== end: ${plantName} ===`);
  }
}

main().catch(console.error);
