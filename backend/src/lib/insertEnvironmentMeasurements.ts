import { supabase } from "./supabase.js";
import type { CsvRow } from "./readCsv.js";

export async function insertEnvironmentMeasurements(plantId: string, rows: CsvRow[]) {
  const records = rows.map((row) => ({
    plant_id: plantId,
    measured_at: row.timestamp,

    light: Number(row.light),
    soil_moisture: Number(row.soil_moisture),
    room_temp: Number(row.room_temp),
    room_humid: Number(row.room_humid),
    soil_temp: Number(row.soil_temp),
  }));

  const { error } = await supabase.from("environment_measurements").upsert(records, {
    onConflict: "plant_id,measured_at",
    ignoreDuplicates: true, // ← 既存は無視
  });

  if (error) {
    throw error;
  }
}
