import type { Dayjs } from "dayjs";

// --- Plants ---

export type PlantType = string;

export type Plant = {
  id: string;
  year: number;
  plant_type: string;
  plant_name: string;
};

// --- Environment (Daily) ---

export type DailyDataPoint = {
  time: string;
  value: number;
};

export type EnvironmentData = {
  soilTemp: number | null;
  soilMoisture: number | null;
  roomTemp: number | null;
  roomHumid: number | null;
  light: number | null;
};

export type EcData = {
  ec: number;
  tds: number;
  temperature: number;
  measuredAt: string;
};

export type Co2DataPoint = {
  time: string;
  value: number;
};

export type EnvironmentSensorColumn =
  | "soil_temp"
  | "soil_moisture"
  | "room_temp"
  | "room_humid"
  | "light";

// --- Environment (Weekly) ---

export type WeeklyStatPoint = {
  date: string;
  max: number;
  min: number;
  avg: number;
};

export type EcWeeklyPoint = {
  date: string;
  ec: number;
  tds: number;
  temperature: number;
};

export type Co2WeeklyPoint = {
  ts: number;
  datetime: string;
  value: number;
};

export type RawPoint = {
  ts: number;
  value: number;
};

// --- Photos ---

export type PhotoRecord = {
  id: string;
  taken_at: string;
  storage_path: string;
  photo_url: string;
};

// --- Fetch params ---

export type FetchDailyParams = {
  plantId: string;
  date: Dayjs;
};

export type FetchWeeklyParams = {
  plantId: string;
  endDate: Dayjs;
};
