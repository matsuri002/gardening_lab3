import { listCsvFiles } from "../lib/onedrive.js";
import { getPlantIdByName } from "../lib/plants.js";
import { supabase } from "../lib/supabase.js";

const BASE_PATH = "onedrive:gardening_lab/komatsuna";

export async function importDailyEnvironment() {
    // komatsuna 配下の個体フォルダ
    const plantNames = ["komatsuna_A"]; //TODO: 将来は自動取得

    for (const plantName of plantNames) {
            const plantId = await getPlantIdByName(plantName);

            const rawDataPath = `${BASE_PATH}/${plantName}/raw_data`;
            const files = listCsvFiles(rawDataPath);

        for (const file of files) {
            // ファイル名から日付抽出
            const match = file.match(/_(\d{4}-\d{2}-\d{2})\.csv$/);
            if (!match) continue;

            const date = match[1];
            const sourceCsvPath = `${rawDataPath}/${file}`;

            // すでに登録済が確認
            const { data } = await supabase
                .from("daily_environment")
                .select("id")
                .eq("source_csv_path", sourceCsvPath);

            if (data && data.length > 0) {
                continue;
            }

            // 登録
            await supabase.from("daily_environment").insert({
                plant_id: plantId,
                date,
                source_csv_path: sourceCsvPath,
            });

            console.log(`registered: ${sourceCsvPath}`);
        }
    }
}

