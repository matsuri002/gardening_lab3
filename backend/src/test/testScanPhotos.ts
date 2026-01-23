import 'dotenv/config'
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { supabase } from "../lib/supabase.js";
import { plantMap } from '../lib/plantMap.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const ONEDRIVE_ROOT = process.env.ONEDRIVE_ROOT;
if (!ONEDRIVE_ROOT) {
  throw new Error("ONEDRIVE_ROOT is not defined");
}

const CAMERA_DIR = path.join(
  ONEDRIVE_ROOT,
  "gardening_lab",
  "komatsuna",
  "komatsuna_A",
  "camera"
);

const scanPhotos = async () => {
  console.log('--- photo scan start ---');

  // ここが植物フォルダのキー
  const plantKey = 'komatsuna_A';
  const plantId = plantMap[plantKey];
  if (!plantId) {
    throw new Error(`Unknown plant key: ${plantKey}`);
  }

  // フォルダ読み込み
  let files: string[];
  try {
    files = fs.readdirSync(CAMERA_DIR);
  } catch (e) {
    console.error('Failed to read camera directory:', CAMERA_DIR, e);
    return;
  }

  for (const file of files) {
    // jpg 以外は無視
    if (!file.toLowerCase().endsWith('.jpg')) continue;

    const filePath = path.join(CAMERA_DIR, file);

    // 📌 ファイル名形式: komatsuna_A_YYYY-MM-DD_HH-MM-SS.jpg
    const match = file.match(
        /^(?<plant>.+)_(?<date>\d{4}-\d{2}-\d{2})_(?<time>\d{2}-\d{2}-\d{2})\.jpg$/i
    );
    if (!match || !match.groups) {
        console.warn('skip: invalid filename format', file);
        continue;
    }

    const { date, time } = match.groups;

    // taken_at を JST として解釈

    if (!time) {
      throw new Error("time が未設定です");
    }

    const takenAt = dayjs(
      `${date} ${time.replace(/-/g, ':')}`,
      'YYYY-MM-DD HH:mm:ss'
    ).format('YYYY-MM-DD HH:mm:ss');

    // OneDrive 上の相対パス
    const photoPath = `${plantKey}/camera/${file}`;

    try {
      // すでに同じ photo_path があるかチェック
      const { data: existsData, error: existsError } =
        await supabase
          .from('photos')
          .select('id')
          .eq('photo_path', photoPath)
          .limit(1);

      if (existsError) {
        console.error('exists check error:', existsError);
        continue;
      }

      if (existsData && existsData.length > 0) {
        // すでに登録済みならスキップ
        console.log('skip (already exists):', file);
        continue;
      }

      // insert
      const { error: insertError } = await supabase
        .from('photos')
        .insert({
          plant_id: plantId,
          taken_at: takenAt,
          photo_path: photoPath,
        });

      if (insertError) {
        console.error('insert error:', file, insertError);
      } else {
        console.log('inserted:', file);
      }
    } catch (e) {
      console.error('unexpected error on file:', file, e);
    }
  }

  console.log('--- photo scan end ---');
};

// 実行
scanPhotos();