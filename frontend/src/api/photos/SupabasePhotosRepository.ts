import { supabase } from "../../lib/supabase";
import type { PhotoRecord } from "../types";
import type { IPhotosRepository } from "./IPhotosRepository";

type PhotoRow = {
  id: string;
  taken_at: string;
  storage_path: string;
};

export class SupabasePhotosRepository implements IPhotosRepository {
  async getPhotosByPlantId(plantId: string): Promise<PhotoRecord[]> {
    const { data, error } = await supabase
      .from("photos")
      .select("id, taken_at, storage_path")
      .eq("plant_id", plantId)
      .order("taken_at", { ascending: true });

    if (error || !data) {
      console.error("写真取得失敗", error);
      return [];
    }

    return (data as PhotoRow[]).map((photo) => {
      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(photo.storage_path);
      return {
        ...photo,
        photo_url: urlData.publicUrl,
      };
    });
  }
}
