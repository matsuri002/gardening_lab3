import type { Plant, PlantType } from "../types";

export interface IPlantsRepository {
  /**
   * 栽培中の野菜の種類（plant_type）のユニークなリストを取得する
   */
  getPlantTypes(): Promise<PlantType[]>;

  /**
   * 指定した野菜の種類に紐づくプランター一覧を取得する
   * @param plantType - 取得対象の野菜の種類
   */
  getPlants(plantType: string): Promise<Plant[]>;

  /**
   * 植物名からIDを取得する
   * @param plantName - 取得対象の植物名
   */
  getPlantIdByName(plantName: string): Promise<string | null>;
}
