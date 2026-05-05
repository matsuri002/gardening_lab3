import "dotenv/config";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { supabase } from "../lib/supabase.js";

const ONEDRIVE_ROOT = process.env.ONEDRIVE_ROOT;
if (!ONEDRIVE_ROOT) {
  throw new Error("ONEDRIVE_ROOT is not defined");
}

const ecDataDir = path.join(
  ONEDRIVE_ROOT,
  "gardening_lab",
  "komatsuna",
  "komatsuna_A",
  "manual_data",
  "ec_tds_data",
);

// plants テーブルから plant_id を取得
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

interface EcCsvRow {
  time: string;
  A_EC: string | number;
  A_TDS: string | number;
  A_Tem: string | number;
}

// CSV を読み込んで行データを返す
async function readCsvRows(csvFilePath: string): Promise<EcCsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: EcCsvRow[] = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row: EcCsvRow) => {
        rows.push(row);
      })
      .on("end", () => {
        resolve(rows);
      })
      .on("error", reject);
  });
}

// time (例: 2025-12-08-1) → timestamp に変換
function parseMeasuredAt(time: string): string {
  const parts = time.split("-");

  // YYYY-MM-DD
  const date = `${parts[0]}-${parts[1]}-${parts[2]}`;

  // 1 → 0時, 2 → 1時
  const hour = Number(parts[3]) - 1;

  return `${date} ${String(hour).padStart(2, "0")}:00:00`;
}

// ec_measurements に INSERT
async function insertEcMeasurements(plantId: string, rows: EcCsvRow[], sourceCsvPath: string) {
  const records = rows.map((row) => ({
    plant_id: plantId,
    measured_at: parseMeasuredAt(row.time),
    ec: Number(row.A_EC),
    tds: Number(row.A_TDS),
    temperature: Number(row.A_Tem),
    source_csv_path: sourceCsvPath,
  }));

  const { error } = await supabase.from("ec_measurements").upsert(records, {
    onConflict: "plant_id,measured_at",
  });

  if (error) {
    throw error;
  }
}

// メイン処理
async function main() {
  const plantName = "komatsuna_A";

  const plantId = await getPlantId(plantName);
  console.log("plant_id =", plantId);

  const files = fs.readdirSync(ecDataDir).filter((file) => file.endsWith(".csv"));

  for (const file of files) {
    const fullCsvPath = path.join(ecDataDir, file);

    const rows = await readCsvRows(fullCsvPath);
    console.log(`${file} 行数=${rows.length}`);

    const firstRow = rows[0];
    if (firstRow) {
      console.log("insert sample =", {
        plant_id: plantId,
        measured_at: parseMeasuredAt(firstRow.time),
        ec: firstRow.A_EC,
        tds: firstRow.A_TDS,
        temperature: firstRow.A_Tem,
      });
    }

    await insertEcMeasurements(
      plantId,
      rows,
      path.join("gardening_lab", "komatsuna", "komatsuna_A", "manual_data", "ec_tds_data", file),
    );
  }
}

main().catch(console.error);
