import "dotenv/config";
import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { supabase } from "../lib/supabase.js";
import { plantMap } from "../lib/plantMap.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const ONEDRIVE_ROOT = process.env.ONEDRIVE_ROOT;
if (!ONEDRIVE_ROOT) {
  throw new Error("ONEDRIVE_ROOT is not defined");
}

const scanPhotos = async () => {
  console.log("--- photo scan start ---");

  // 対象植物
  const targets = ["komatsuna_A", "komatsuna_B", "komatsuna_C"];

  for (const plantKey of targets) {
    const plantId = plantMap[plantKey];
    if (!plantId) {
      console.warn(`Unknown plant key: ${plantKey}`);
      continue;
    }

    // plantKeyごとにディレクトリ生成
    const CAMERA_DIR = path.join(ONEDRIVE_ROOT, "gardening_lab", "komatsuna", plantKey, "camera");

    let files: string[];
    try {
      files = fs.readdirSync(CAMERA_DIR);
    } catch (_e) {
      console.warn("camera dir missing:", CAMERA_DIR);
      continue;
    }

    for (const file of files) {
      // jpg 以外は無視
      if (!file.toLowerCase().endsWith(".jpg")) continue;

      // ファイル名形式: komatsuna_A_YYYY-MM-DD_HH-MM-SS.jpg
      const match = file.match(
        /^(?<plant>.+)_(?<date>\d{4}-\d{2}-\d{2})_(?<time>\d{2}-\d{2}-\d{2})\.jpg$/i,
      );
      if (!match || !match.groups) continue;

      const { date, time } = match.groups;

      // 型エラー対策（前回の最小修正）
      if (!date || !time) continue;

      const takenAt = dayjs(`${date} ${time.replace(/-/g, ":")}`, "YYYY-MM-DD HH:mm:ss").format(
        "YYYY-MM-DD HH:mm:ss",
      );

      // OneDrive 上の相対パス
      const fullPath = path.join(CAMERA_DIR, file);
      const storagePath = `${plantKey}/${file}`;

      try {
        // すでに同じ photo_path があるかチェック
        const { data: existsData } = await supabase
          .from("photos")
          .select("id")
          .eq("storage_path", storagePath)
          .limit(1);

        if (existsData && existsData.length > 0) continue;

        await supabase.storage
          .from("photos")
          .upload(storagePath, fs.createReadStream(fullPath), { upsert: true });

        await supabase.from("photos").insert({
          plant_id: plantId,
          taken_at: takenAt,
          storage_path: storagePath,
        });

        console.log("inserted:", storagePath);
      } catch (e) {
        console.error("error:", file, e);
      }
    }
  }

  console.log("--- photo scan end ---");
};

// 実行
scanPhotos();
