import dayjs, { type Dayjs } from "dayjs";
import {
  generateMockCo2Daily,
  generateMockCo2Weekly,
  generateMockDailyData,
  generateMockEcData,
  generateMockEcWeekly,
  generateMockEnvData,
  generateMockWeeklyRawData,
  generateMockWeeklyStats,
} from "../../mocks/generators";
import type {
  Co2DataPoint,
  Co2WeeklyPoint,
  DailyDataPoint,
  EcData,
  EcWeeklyPoint,
  EnvironmentSensorColumn,
  RawPoint,
  WeeklyStatPoint,
} from "../types";
import type { EnvironmentSnapshot, IEnvironmentRepository } from "./IEnvironmentRepository";
import { getMockSensorRange } from "./sensorRanges";

export class MockEnvironmentRepository implements IEnvironmentRepository {
  async getEnvironmentSnapshot(_plantId: string, _targetDate: Dayjs): Promise<EnvironmentSnapshot> {
    return {
      envData: generateMockEnvData(),
      measuredAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      noDataMessage: null,
    };
  }

  async getDailySensorSeries(
    _plantId: string,
    targetDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<DailyDataPoint[]> {
    const { min, max } = getMockSensorRange(column);
    return generateMockDailyData(targetDate, min, max);
  }

  async getEcDataForDate(_plantId: string, targetDateStr: string): Promise<EcData> {
    return generateMockEcData(targetDateStr);
  }

  async getLatestCo2(_plantId: string, _targetDate: Dayjs): Promise<Co2DataPoint> {
    return { time: dayjs().format("HH:mm"), value: 600 };
  }

  async getDailyCo2Series(_plantId: string, targetDate: Dayjs): Promise<Co2DataPoint[]> {
    return generateMockCo2Daily(targetDate);
  }

  async getWeeklyStats(
    _plantId: string,
    endDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<WeeklyStatPoint[]> {
    const { min, max } = getMockSensorRange(column);
    return generateMockWeeklyStats(endDate, min, max);
  }

  async getWeeklyRawSeries(
    _plantId: string,
    endDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<RawPoint[]> {
    const { min, max } = getMockSensorRange(column);
    return generateMockWeeklyRawData(endDate, min, max);
  }

  async getEcWeeklySeries(_plantId: string, endDate: Dayjs): Promise<EcWeeklyPoint[]> {
    return generateMockEcWeekly(endDate);
  }

  async getCo2WeeklySeries(_plantId: string, endDate: Dayjs): Promise<Co2WeeklyPoint[]> {
    return generateMockCo2Weekly(endDate);
  }
}
