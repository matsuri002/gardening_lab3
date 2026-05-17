import type { Dayjs } from "dayjs";
import type {
  EnvironmentData,
  DailyDataPoint,
  EcData,
  Co2DataPoint,
} from "../hooks/useDailyEnvironment/useDailyEnvironment";
import type {
  WeeklyStatPoint,
  EcWeeklyPoint,
  Co2WeeklyPoint,
  RawPoint,
} from "../hooks/useWeeklyEnvironment/useWeeklyEnvironment";

// --- Utility Functions ---
const getRandomValue = (min: number, max: number): number => {
  return Number((Math.random() * (max - min) + min).toFixed(1));
};

// --- Mock Generators for Daily Data ---

export const generateMockEnvData = (): EnvironmentData => ({
  soilTemp: getRandomValue(20, 25),
  soilMoisture: getRandomValue(40, 60),
  roomTemp: getRandomValue(22, 28),
  roomHumid: getRandomValue(50, 70),
  light: getRandomValue(300, 800),
});

export const generateMockDailyData = (
  date: Dayjs,
  min: number,
  max: number,
  points: number = 24,
): DailyDataPoint[] => {
  const data: DailyDataPoint[] = [];
  let current = date.startOf("day");
  for (let i = 0; i < points; i++) {
    data.push({
      time: current.format("HH:mm"),
      value: getRandomValue(min, max),
    });
    current = current.add(24 / points, "hour");
  }
  return data;
};

export const generateMockEcData = (date: string): EcData => ({
  ec: getRandomValue(1.0, 2.5),
  tds: getRandomValue(500, 1500),
  temperature: getRandomValue(20, 25),
  measuredAt: `${date} 12:00:00`,
});

export const generateMockCo2Daily = (date: Dayjs): Co2DataPoint[] => {
  return generateMockDailyData(date, 400, 800, 12);
};

// --- Mock Generators for Weekly Data ---

export const generateMockWeeklyStats = (
  endDate: Dayjs,
  minBase: number,
  maxBase: number,
): WeeklyStatPoint[] => {
  const data: WeeklyStatPoint[] = [];
  const start = endDate.subtract(6, "day");
  for (let i = 0; i < 7; i++) {
    const current = start.add(i, "day");
    const min = getRandomValue(minBase - 2, minBase + 2);
    const max = getRandomValue(maxBase - 2, maxBase + 2);
    data.push({
      date: current.format("MM/DD"),
      min: min,
      max: max,
      avg: Number(((min + max) / 2).toFixed(1)),
    });
  }
  return data;
};

export const generateMockWeeklyRawData = (endDate: Dayjs, min: number, max: number): RawPoint[] => {
  const data: RawPoint[] = [];
  let current = endDate.subtract(6, "day").startOf("day");
  for (let i = 0; i < 7 * 4; i++) {
    // 4 points per day
    data.push({
      ts: current.valueOf(),
      value: getRandomValue(min, max),
    });
    current = current.add(6, "hour");
  }
  return data;
};

export const generateMockEcWeekly = (endDate: Dayjs): EcWeeklyPoint[] => {
  const data: EcWeeklyPoint[] = [];
  const start = endDate.subtract(6, "day");
  for (let i = 0; i < 7; i++) {
    const current = start.add(i, "day");
    data.push({
      date: current.format("MM/DD"),
      ec: getRandomValue(1.0, 2.5),
      tds: getRandomValue(500, 1500),
      temperature: getRandomValue(20, 25),
    });
  }
  return data;
};

export const generateMockCo2Weekly = (endDate: Dayjs): Co2WeeklyPoint[] => {
  const data: Co2WeeklyPoint[] = [];
  let current = endDate.subtract(6, "day").startOf("day");
  for (let i = 0; i < 7 * 4; i++) {
    data.push({
      ts: current.valueOf(),
      datetime: current.format("YYYY/MM/DD HH:mm"),
      value: getRandomValue(400, 800),
    });
    current = current.add(6, "hour");
  }
  return data;
};
