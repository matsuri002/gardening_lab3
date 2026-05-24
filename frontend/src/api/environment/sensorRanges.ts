import type { EnvironmentSensorColumn } from "../types";

/** モック生成時のセンサー値レンジ（日次・週次共通） */
export function getMockSensorRange(column: EnvironmentSensorColumn): { min: number; max: number } {
  switch (column) {
    case "soil_temp":
    case "room_temp":
      return { min: 15, max: 30 };
    case "soil_moisture":
    case "room_humid":
      return { min: 40, max: 80 };
    case "light":
      return { min: 100, max: 1000 };
    default:
      return { min: 0, max: 100 };
  }
}
