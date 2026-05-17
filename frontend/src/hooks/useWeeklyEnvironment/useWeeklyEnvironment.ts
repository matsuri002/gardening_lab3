import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  generateMockWeeklyStats,
  generateMockWeeklyRawData,
  generateMockEcWeekly,
  generateMockCo2Weekly,
} from "../../mocks/generators";

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

export type ViewMode = "standard" | "processed";

export const useWeeklyEnvironment = (plantName: string | undefined) => {
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs());
  const [plantId, setPlantId] = useState<string | null>(null);

  // 表示モード
  const [soilTempMode, setSoilTempMode] = useState<ViewMode>("standard");
  const [soilMoistureMode, setSoilMoistureMode] = useState<ViewMode>("standard");
  const [roomTempMode, setRoomTempMode] = useState<ViewMode>("standard");
  const [roomHumidMode, setRoomHumidMode] = useState<ViewMode>("standard");
  const [lightMode, setLightMode] = useState<ViewMode>("processed");

  // データ State
  const [soilTempWeekly, setSoilTempWeekly] = useState<WeeklyStatPoint[]>([]);
  const [soilTempRaw, setSoilTempRaw] = useState<RawPoint[]>([]);

  const [soilMoistureWeekly, setSoilMoistureWeekly] = useState<WeeklyStatPoint[]>([]);
  const [soilMoistureRaw, setSoilMoistureRaw] = useState<RawPoint[]>([]);

  const [roomTempWeekly, setRoomTempWeekly] = useState<WeeklyStatPoint[]>([]);
  const [roomTempRaw, setRoomTempRaw] = useState<RawPoint[]>([]);

  const [roomHumidWeekly, setRoomHumidWeekly] = useState<WeeklyStatPoint[]>([]);
  const [roomHumidRaw, setRoomHumidRaw] = useState<RawPoint[]>([]);

  const [lightWeekly, setLightWeekly] = useState<WeeklyStatPoint[]>([]);
  const [lightRaw, setLightRaw] = useState<RawPoint[]>([]);

  const [ecWeekly, setEcWeekly] = useState<EcWeeklyPoint[]>([]);
  const [co2Weekly, setCo2Weekly] = useState<Co2WeeklyPoint[]>([]);

  const fetchPlantId = useCallback(async () => {
    if (!plantName) return;
    if (import.meta.env.VITE_USE_MOCK === "true") {
      setPlantId("mock_plant_id");
      return;
    }
    const { data, error } = await supabase
      .from("plants")
      .select("id")
      .eq("plant_name", plantName)
      .single();

    if (error || !data) {
      console.error("plant_id取得失敗:", error);
      return;
    }
    setPlantId(data.id);
  }, [plantName]);

  const fetchWeeklyStats = useCallback(
    async (
      endDate: dayjs.Dayjs,
      column: "soil_temp" | "room_temp" | "room_humid" | "soil_moisture" | "light",
    ): Promise<WeeklyStatPoint[]> => {
      if (!plantId) return [];
      if (import.meta.env.VITE_USE_MOCK === "true") {
        let minBase = 0,
          maxBase = 100;
        if (column === "soil_temp" || column === "room_temp") {
          minBase = 15;
          maxBase = 30;
        } else if (column === "soil_moisture" || column === "room_humid") {
          minBase = 40;
          maxBase = 80;
        } else if (column === "light") {
          minBase = 100;
          maxBase = 1000;
        }
        return generateMockWeeklyStats(endDate, minBase, maxBase);
      }
      const end = endDate.endOf("day");
      const start = end.subtract(6, "day").startOf("day");

      const { data, error } = await supabase
        .from("environment_measurements")
        .select(`measured_at, ${column}`)
        .eq("plant_id", plantId!)
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
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return {
          date,
          max: Number(max.toFixed(1)),
          avg: Number(avg.toFixed(1)),
          min: Number(min.toFixed(1)),
        };
      });
    },
    [plantId],
  );

  const fetchWeeklyRawData = useCallback(
    async (
      endDate: dayjs.Dayjs,
      column: "soil_temp" | "room_temp" | "room_humid" | "soil_moisture" | "light",
    ): Promise<RawPoint[]> => {
      if (!plantId) return [];
      if (import.meta.env.VITE_USE_MOCK === "true") {
        let min = 0,
          max = 100;
        if (column === "soil_temp" || column === "room_temp") {
          min = 15;
          max = 30;
        } else if (column === "soil_moisture" || column === "room_humid") {
          min = 40;
          max = 80;
        } else if (column === "light") {
          min = 100;
          max = 1000;
        }
        return generateMockWeeklyRawData(endDate, min, max);
      }
      const end = endDate.endOf("day");
      const start = end.subtract(6, "day").startOf("day");

      const { data, error } = await supabase
        .from("environment_measurements")
        .select(`measured_at, ${column}`)
        .eq("plant_id", plantId!)
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
    },
    [plantId],
  );

  const fetchEcWeeklyData = useCallback(
    async (endDate: dayjs.Dayjs) => {
      if (!plantId) return;
      if (import.meta.env.VITE_USE_MOCK === "true") {
        setEcWeekly(generateMockEcWeekly(endDate));
        return;
      }
      try {
        const { data, error } = await supabase
          .from("ec_measurements")
          .select(`ec, tds, temperature, measured_at`)
          .eq("plant_id", plantId!)
          .order("measured_at", { ascending: true });

        if (error || !data) {
          setEcWeekly([]);
          return;
        }

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

        const averaged = Object.entries(grouped).map(([date, rows]) => {
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
        setEcWeekly(averaged);
      } catch (err) {
        console.error("ECデータ取得失敗:", err);
        setEcWeekly([]);
      }
    },
    [plantId],
  );

  const fetchWeeklyCo2Data = useCallback(
    async (endDate: dayjs.Dayjs) => {
      if (!plantId) return;
      if (import.meta.env.VITE_USE_MOCK === "true") {
        setCo2Weekly(generateMockCo2Weekly(endDate));
        return;
      }
      try {
        const end = endDate.endOf("day");
        const start = end.subtract(6, "day").startOf("day");
        const { data, error } = await supabase
          .from("co2_measurements")
          .select("measured_at, co2")
          .eq("plant_id", plantId!)
          .gte("measured_at", start.format("YYYY-MM-DD HH:mm:ss"))
          .lte("measured_at", end.format("YYYY-MM-DD HH:mm:ss"))
          .order("measured_at", { ascending: true });

        if (error || !data) {
          setCo2Weekly([]);
          return;
        }

        const formatted: Co2WeeklyPoint[] = data
          .filter((row) => row.co2 != null)
          .map((row) => {
            const m = dayjs(row.measured_at.replace("+00", ""));
            return {
              ts: m.valueOf(),
              datetime: m.format("YYYY/MM/DD HH:mm"),
              value: Number(row.co2),
            };
          });
        setCo2Weekly(formatted);
      } catch (err) {
        console.error("CO₂週次データ取得失敗:", err);
        setCo2Weekly([]);
      }
    },
    [plantId],
  );

  const xTicks7 = useMemo(() => {
    const end = endDate.startOf("day");
    const start = end.subtract(6, "day");
    return Array.from({ length: 7 }, (_, i) => start.add(i, "day").valueOf());
  }, [endDate]);

  const xDomain7: [number, number] = useMemo(() => {
    const end = xTicks7[6] + 24 * 60 * 60 * 1000 - 1;
    return [xTicks7[0], end];
  }, [xTicks7]);

  const cultivationStart = dayjs("2025-12-08"); // 実際はDBから
  const daysFromStart = endDate.diff(cultivationStart, "day");
  const isGermination = daysFromStart <= 10;

  const komatsunaTempRange = useMemo(
    () =>
      isGermination
        ? [
            {
              y1: 20,
              y2: 25,
              label: "発芽適温",
              fill: "#c18585",
            },
          ]
        : [
            {
              y1: 15,
              y2: 25,
              label: "生育適温",
              fill: "#92c185",
            },
          ],
    [isGermination],
  );

  // 初期化: plantId取得
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlantId();
  }, [fetchPlantId]);

  // データフェッチ
  useEffect(() => {
    if (!endDate || !plantId) return;

    if (soilTempMode === "standard") {
      fetchWeeklyRawData(endDate, "soil_temp").then(setSoilTempRaw);
    } else {
      fetchWeeklyStats(endDate, "soil_temp").then(setSoilTempWeekly);
    }

    if (soilMoistureMode === "standard") {
      fetchWeeklyRawData(endDate, "soil_moisture").then(setSoilMoistureRaw);
    } else {
      fetchWeeklyStats(endDate, "soil_moisture").then(setSoilMoistureWeekly);
    }

    if (roomTempMode === "standard") {
      fetchWeeklyRawData(endDate, "room_temp").then(setRoomTempRaw);
    } else {
      fetchWeeklyStats(endDate, "room_temp").then(setRoomTempWeekly);
    }

    if (roomHumidMode === "standard") {
      fetchWeeklyRawData(endDate, "room_humid").then(setRoomHumidRaw);
    } else {
      fetchWeeklyStats(endDate, "room_humid").then(setRoomHumidWeekly);
    }

    if (lightMode === "standard") {
      fetchWeeklyRawData(endDate, "light").then(setLightRaw);
    } else {
      fetchWeeklyStats(endDate, "light").then(setLightWeekly);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEcWeeklyData(endDate);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWeeklyCo2Data(endDate);
  }, [
    plantId,
    endDate,
    soilTempMode,
    soilMoistureMode,
    roomTempMode,
    roomHumidMode,
    lightMode,
    fetchWeeklyRawData,
    fetchWeeklyStats,
    fetchEcWeeklyData,
    fetchWeeklyCo2Data,
  ]);

  return {
    plantId,
    endDate,
    setEndDate,
    xTicks7,
    xDomain7,
    komatsunaTempRange,
    soilTemp: {
      mode: soilTempMode,
      setMode: setSoilTempMode,
      raw: soilTempRaw,
      weekly: soilTempWeekly,
    },
    soilMoisture: {
      mode: soilMoistureMode,
      setMode: setSoilMoistureMode,
      raw: soilMoistureRaw,
      weekly: soilMoistureWeekly,
    },
    roomTemp: {
      mode: roomTempMode,
      setMode: setRoomTempMode,
      raw: roomTempRaw,
      weekly: roomTempWeekly,
    },
    roomHumid: {
      mode: roomHumidMode,
      setMode: setRoomHumidMode,
      raw: roomHumidRaw,
      weekly: roomHumidWeekly,
    },
    light: { mode: lightMode, setMode: setLightMode, raw: lightRaw, weekly: lightWeekly },
    ecWeekly,
    co2Weekly,
  };
};
