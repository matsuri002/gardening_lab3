import type { PhotoRecord } from "../types";

/**
 * 写真データ取得のインターフェース定義。
 * Supabase 実装（SupabasePhotosRepository）とモック実装（MockPhotosRepository）が本契約に従う。
 */
export interface IPhotosRepository {
  /**
   * 指定した植物に紐づく写真一覧を取得する（撮影日時の昇順）
   * @param plantId - 取得対象の植物 ID
   */
  getPhotosByPlantId(plantId: string): Promise<PhotoRecord[]>;
}
