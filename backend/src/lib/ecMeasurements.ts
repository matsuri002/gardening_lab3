import { supabase } from "./supabase.js";

export type EcMeasurementInsert = {
  plant_id: string;
  measured_at: string; // ISO文字列
  ec: number;
  tds: number;
  temperature: number | null;
  source_csv_path: string;
};

/**
 * EC測定データをUPSERTする
 * plant_id + measured_at で重複防止
 */
export async function upsertEcMeasurements(records: EcMeasurementInsert[]) {
  if (records.length === 0) return;

  const { error } = await supabase.from("ec_measurements").upsert(records, {
    onConflict: "plant_id,measured_at",
  });

  if (error) {
    throw error;
  }

  console.log(`EC UPSERT OK: ${records.length} records`);
}
