import type { Plant, PlantType } from "../types";
import type { IPlantsRepository } from "./IPlantsRepository";

const MOCK_PLANT_TYPES: PlantType[] = ["コマツナ", "トマト"];

export class MockPlantsRepository implements IPlantsRepository {
  async getPlantTypes(): Promise<PlantType[]> {
    return MOCK_PLANT_TYPES;
  }

  async getPlants(plantType: string): Promise<Plant[]> {
    return [
      {
        id: "mock_1",
        year: 2026,
        plant_type: plantType,
        plant_name: `${plantType}1号`,
      },
      {
        id: "mock_2",
        year: 2026,
        plant_type: plantType,
        plant_name: `${plantType}2号`,
      },
    ];
  }

  async getPlantIdByName(plantName: string): Promise<string | null> {
    // plantName を使用しないがインターフェースを満たすため引数として受け取る
    void plantName;
    return "mock_plant_id";
  }
}
