import "dotenv/config";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { supabase } from "../lib/supabase.js";

/**
 * ONEDRIVE_ROOT
 */
const ONEDRIVE_ROOT = process.env.ONEDRIVE_ROOT;
if (!ONEDRIVE_ROOT) {
  throw new Error("ONEDRIVE_ROOT is not defined");
}

/**
 * CO2 CSV ディレクトリ
 * ec と同じ考え方で「co2_data」まで含める
 */
const co2DataDir = path.join(
  ONEDRIVE_ROOT,
  "gardening_lab",
  "komatsuna",
  "komatsuna_A",
  "manual_data",
  "co2_data",
);

interface Co2CsvRow {
  time: string;
  co2?: string | number;
  tem?: string | number;
  hum?: string | number;
}

/**
 * plants テーブルから plant_id を取得
 */
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

/**
 * CSV を読み込む
 */
async function readCsvRows(csvFilePath: string): Promise<Co2CsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: Co2CsvRow[] = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row: Co2CsvRow) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

/**
 * time (例: 2026/01/27 06:00:00) → timestamp
 */
function parseMeasuredAt(time: string): string {
  // "/" を "-" に変換してそのまま使う
  return time.replace(/\//g, "-");
}

/**
 * co2_measurements に UPSERT
 */
async function upsertCo2Measurements(
  plantId: string,
  rows: Co2CsvRow[],
  sourceCsvPath: string,
) {
  const records = rows.map((row) => ({
    plant_id: plantId,
    measured_at: parseMeasuredAt(row.time),
    co2: row.co2 ? Number(row.co2) : null,
    temperature: row.tem ? Number(row.tem) : null,
    humidity: row.hum ? Number(row.hum) : null,
    source_csv_path: sourceCsvPath,
  }));

  const { error } = await supabase.from("co2_measurements").upsert(records, {
    onConflict: "plant_id,measured_at",
  });

  if (error) {
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  const plantName = "komatsuna_A";

  const plantId = await getPlantId(plantName);
  console.log("plant_id =", plantId);

  const files = fs.readdirSync(co2DataDir).filter((file) => file.endsWith(".csv"));

  for (const file of files) {
    const fullCsvPath = path.join(co2DataDir, file);
    const rows = await readCsvRows(fullCsvPath);

    console.log(`${file} 行数=${rows.length}`);
    const firstRow = rows[0];
    if (firstRow) {
      console.log("insert sample =", {
        plant_id: plantId,
        measured_at: parseMeasuredAt(firstRow.time),
        co2: firstRow.co2,
        temperature: firstRow.tem,
        humidity: firstRow.hum,
      });
    }

    await upsertCo2Measurements(
      plantId,
      rows,
      path.join("gardening_lab", "komatsuna", "komatsuna_A", "manual_data", "co2_data", file),
    );

    console.log(`UPSERT 完了: ${file}`);
  }
}

main().catch(console.error);
