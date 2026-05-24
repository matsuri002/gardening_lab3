import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { supabase } from "../../lib/supabase";
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

dayjs.extend(utc);

type EnvironmentRow = {
  measured_at: string;
  soil_temp: number | null;
  soil_moisture: number | null;
  room_temp: number | null;
  room_humid: number | null;
  light: number | null;
};

type EcRow = {
  ec: number;
  tds: number;
  temperature: number;
  measured_at: string;
};

type Co2Row = {
  measured_at: string;
  co2: number | null;
};

const avg = (values: number[]) =>
  values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

const emptyEnvironmentData = (): EnvironmentSnapshot["envData"] => ({
  soilTemp: null,
  soilMoisture: null,
  roomTemp: null,
  roomHumid: null,
  light: null,
});

export class SupabaseEnvironmentRepository implements IEnvironmentRepository {
  async getEnvironmentSnapshot(plantId: string, targetDate: Dayjs): Promise<EnvironmentSnapshot> {
    try {
      const base = targetDate.format("YYYY-MM-DD");
      const isToday = targetDate.isSame(dayjs(), "day");

      let query = supabase
        .from("environment_measurements")
        .select("measured_at, soil_temp, soil_moisture, room_temp, room_humid, light")
        .eq("plant_id", plantId);

      if (isToday) {
        query = query
          .gte("measured_at", `${base} 00:00:00`)
          .lte("measured_at", `${base} 23:59:59`)
          .order("measured_at", { ascending: false })
          .limit(1);
      } else {
        const now = dayjs();
        const roundedMinute = now.minute() < 30 ? "00" : "30";
        const hour = now.hour().toString().padStart(2, "0");
        const targetTime = `${hour}:${roundedMinute}`;

        query = query
          .gte("measured_at", `${base} ${targetTime}:00`)
          .lte("measured_at", `${base} ${targetTime}:59`)
          .order("measured_at", { ascending: false })
          .limit(1);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          envData: emptyEnvironmentData(),
          measuredAt: null,
          noDataMessage: isToday ? "本日のデータはありません" : "該当時刻のデータはありません",
        };
      }

      const record = data[0];
      return {
        envData: {
          soilTemp: record.soil_temp,
          soilMoisture: record.soil_moisture,
          roomTemp: record.room_temp,
          roomHumid: record.room_humid,
          light: record.light,
        },
        measuredAt: record.measured_at,
        noDataMessage: null,
      };
    } catch (err) {
      console.error("環境データ取得失敗:", err);
      return {
        envData: emptyEnvironmentData(),
        measuredAt: null,
        noDataMessage: null,
      };
    }
  }

  async getDailySensorSeries(
    plantId: string,
    targetDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<DailyDataPoint[]> {
    try {
      const base = targetDate.format("YYYY-MM-DD");
      const { data, error } = await supabase
        .from("environment_measurements")
        .select(`measured_at, ${column}`)
        .eq("plant_id", plantId)
        .gte("measured_at", `${base} 00:00:00`)
        .lte("measured_at", `${base} 23:59:59`)
        .order("measured_at", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return (data as EnvironmentRow[])
        .filter((row) => row[column] !== null)
        .map((row) => ({
          time: dayjs(row.measured_at.replace("+00", "")).format("HH:mm"),
          value: row[column] as number,
        }));
    } catch (err) {
      console.error(`日内推移取得失敗 (${column}):`, err);
      return [];
    }
  }

  private async fetchEcRowsByDate(plantId: string, date: string): Promise<EcRow[]> {
    const { data } = await supabase
      .from("ec_measurements")
      .select("ec, tds, temperature, measured_at")
      .eq("plant_id", plantId)
      .gte("measured_at", `${date} 00:00:00`)
      .lte("measured_at", `${date} 23:59:59`);
    return (data ?? []) as EcRow[];
  }

  async getEcDataForDate(plantId: string, targetDateStr: string): Promise<EcData | null> {
    let rows = await this.fetchEcRowsByDate(plantId, targetDateStr);

    if (rows.length === 0) {
      const { data } = await supabase
        .from("ec_measurements")
        .select("measured_at")
        .eq("plant_id", plantId)
        .lt("measured_at", `${targetDateStr} 00:00:00`)
        .order("measured_at", { ascending: false })
        .limit(1);

      if (!data || data.length === 0) return null;

      const latestDate = dayjs(data[0].measured_at).format("YYYY-MM-DD");
      rows = await this.fetchEcRowsByDate(plantId, latestDate);
      if (rows.length === 0) return null;
      targetDateStr = latestDate;
    }

    return {
      ec: Math.round(avg(rows.map((r) => r.ec))),
      tds: Math.round(avg(rows.map((r) => r.tds))),
      temperature: Number(avg(rows.map((r) => r.temperature)).toFixed(1)),
      measuredAt: targetDateStr,
    };
  }

  async getLatestCo2(plantId: string, targetDate: Dayjs): Promise<Co2DataPoint | null> {
    const base = targetDate.format("YYYY-MM-DD");
    const isToday = targetDate.isSame(dayjs(), "day");

    let query = supabase
      .from("co2_measurements")
      .select("measured_at, co2")
      .eq("plant_id", plantId);

    if (isToday) {
      query = query
        .gte("measured_at", `${base} 00:00:00`)
        .lte("measured_at", `${base} 23:59:59`)
        .order("measured_at", { ascending: false })
        .limit(1);
    } else {
      const hour = Math.floor(dayjs().hour() / 6) * 6;
      const targetHour = hour.toString().padStart(2, "0");
      query = query
        .gte("measured_at", `${base} ${targetHour}:00:00`)
        .lte("measured_at", `${base} ${targetHour}:59:59`)
        .order("measured_at", { ascending: false })
        .limit(1);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return null;

    return {
      time: dayjs.utc(data[0].measured_at).format("HH:mm"),
      value: data[0].co2,
    };
  }

  async getDailyCo2Series(plantId: string, targetDate: Dayjs): Promise<Co2DataPoint[]> {
    try {
      const base = targetDate.format("YYYY-MM-DD");
      const { data, error } = await supabase
        .from("co2_measurements")
        .select("measured_at, co2")
        .eq("plant_id", plantId)
        .gte("measured_at", `${base} 00:00:00`)
        .lte("measured_at", `${base} 23:59:59`)
        .order("measured_at", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return (data as Co2Row[])
        .filter((row) => row.co2 !== null)
        .map((row) => ({
          time: dayjs.utc(row.measured_at).format("HH:mm"),
          value: row.co2 as number,
        }));
    } catch (err) {
      console.error("CO2 日内データ取得失敗:", err);
      return [];
    }
  }

  async getWeeklyStats(
    plantId: string,
    endDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<WeeklyStatPoint[]> {
    const end = endDate.endOf("day");
    const start = end.subtract(6, "day").startOf("day");

    const { data, error } = await supabase
      .from("environment_measurements")
      .select(`measured_at, ${column}`)
      .eq("plant_id", plantId)
      .gte("measured_at", start.format("YYYY-MM-DD HH:mm:ss"))
      .lte("measured_at", end.format("YYYY-MM-DD HH:mm:ss"));

    if (error || !data) return [];

    const grouped: Record<string, number[]> = {};
    data.forEach((row: { measured_at: string } & Record<string, unknown>) => {
      if (row[column] == null) return;
      const date = dayjs(row.measured_at.replace("+00", "")).format("MM/DD");
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(Number(row[column]));
    });

    return Object.entries(grouped).map(([date, values]) => {
      const max = Math.max(...values);
      const min = Math.min(...values);
      const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        date,
        max: Number(max.toFixed(1)),
        avg: Number(avgVal.toFixed(1)),
        min: Number(min.toFixed(1)),
      };
    });
  }

  async getWeeklyRawSeries(
    plantId: string,
    endDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<RawPoint[]> {
    const end = endDate.endOf("day");
    const start = end.subtract(6, "day").startOf("day");

    const { data, error } = await supabase
      .from("environment_measurements")
      .select(`measured_at, ${column}`)
      .eq("plant_id", plantId)
      .gte("measured_at", start.format("YYYY-MM-DD HH:mm:ss"))
      .lte("measured_at", end.format("YYYY-MM-DD HH:mm:ss"))
      .order("measured_at", { ascending: true });

    if (error || !data) return [];

    return data
      .filter((row: Record<string, unknown>) => row[column] != null)
      .map((row: { measured_at: string } & Record<string, unknown>) => {
        const m = dayjs(row.measured_at.replace("+00", ""));
        return { ts: m.valueOf(), value: Number(row[column]) };
      });
  }

  async getEcWeeklySeries(_plantId: string, _endDate: Dayjs): Promise<EcWeeklyPoint[]> {
    try {
      const { data, error } = await supabase
        .from("ec_measurements")
        .select("ec, tds, temperature, measured_at")
        .eq("plant_id", _plantId)
        .order("measured_at", { ascending: true });

      if (error || !data) return [];

      const grouped: Record<string, EcWeeklyPoint[]> = {};
      data.forEach(
        (row: {
          ec: number | null;
          tds: number | null;
          temperature: number | null;
          measured_at: string;
        }) => {
          if (row.ec == null) return;
          const date = dayjs(row.measured_at.replace("+00", "")).format("MM/DD");
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push({
            date,
            ec: Number(row.ec),
            tds: Number(row.tds),
            temperature: Number(row.temperature),
          });
        },
      );

      return Object.entries(grouped).map(([date, rows]) => {
        const ecAvg = rows.reduce((sum, r) => sum + r.ec, 0) / rows.length;
        const tdsAvg = rows.reduce((sum, r) => sum + r.tds, 0) / rows.length;
        const tempAvg = rows.reduce((sum, r) => sum + r.temperature, 0) / rows.length;
        return {
          date,
          ec: Number(ecAvg.toFixed(1)),
          tds: Number(tdsAvg.toFixed(1)),
          temperature: Number(tempAvg.toFixed(1)),
        };
      });
    } catch (err) {
      console.error("ECデータ取得失敗:", err);
      return [];
    }
  }

  async getCo2WeeklySeries(plantId: string, endDate: Dayjs): Promise<Co2WeeklyPoint[]> {
    try {
      const end = endDate.endOf("day");
      const start = end.subtract(6, "day").startOf("day");
      const { data, error } = await supabase
        .from("co2_measurements")
        .select("measured_at, co2")
        .eq("plant_id", plantId)
        .gte("measured_at", start.format("YYYY-MM-DD HH:mm:ss"))
        .lte("measured_at", end.format("YYYY-MM-DD HH:mm:ss"))
        .order("measured_at", { ascending: true });

      if (error || !data) return [];

      return data
        .filter((row) => row.co2 != null)
        .map((row) => {
          const m = dayjs(row.measured_at.replace("+00", ""));
          return {
            ts: m.valueOf(),
            datetime: m.format("YYYY/MM/DD HH:mm"),
            value: Number(row.co2),
          };
        });
    } catch (err) {
      console.error("CO₂週次データ取得失敗:", err);
      return [];
    }
  }
}
