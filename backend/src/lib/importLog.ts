import { supabase } from "./supabase.js";

// plantIdとcsvFilenameでsupabaseに既に取り込まれているかの確認
export async function isCsvImported(
  plantId: string,
  csvFilename: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("import_logs")
    .select("id")
    .eq("plant_id", plantId)
    .eq("csv_filename", csvFilename)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}

// 取り込み履歴の追加
export async function insertImportLog(
  plantId: string,
  csvFilename: string,
  csvDate: string,
  rowCount: number
) {
  const { error } = await supabase.from("import_logs").insert({
    plant_id: plantId,
    csv_filename: csvFilename,
    csv_date: csvDate,
    row_count: rowCount
  });

  if (error) {
    throw error;
  }
}