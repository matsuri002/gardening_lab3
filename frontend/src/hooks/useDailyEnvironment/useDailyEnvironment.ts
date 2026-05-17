import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { supabase } from "../../lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  generateMockEnvData,
  generateMockDailyData,
  generateMockEcData,
  generateMockCo2Daily,
} from "../../mocks/generators";

dayjs.extend(utc);

// --- Types ---

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

type AdviceRule = {
  from: number;
  to: number;
  text: string;
};

// --- Constants ---

const KOMATSUNA_ADVICE_RULES: AdviceRule[] = [
  {
    from: 0,
    to: 10,
    text: "発芽適温は20~25℃です。播種後は2~3日で発芽しますが、低温だとこの2~3倍の発芽日数を要します。土は乾きすぎないように。発芽までは特に水分が重要です。",
  },
  {
    from: 11,
    to: 15,
    text: "間引き（1回目）を行ってください。目安：子葉の形が正ハートのものを残し、大きすぎるものや小さいものを優先して間引きましょう。株間2cm程度。",
  },
  {
    from: 16,
    to: 20,
    text: "本葉2~3枚になったら最終間引きを行ってください。目安：株間4~5cm。本葉4〜5枚までは5℃以下にしないよう保温すると抽苔（とう立ち）予防になります。",
  },
  {
    from: 21,
    to: 40,
    text: "葉が次々と展開し始め、株が目に見えて大きくなります。葉色が濃くなってきたら順調に育っています。灌水は控えめに。本葉3〜4枚以降は過湿にすると軟弱徒長しやすくなります。",
  },
  {
    from: 41,
    to: 50,
    text: "葉が増えてボリュームが出る時期です。株が密集している場合、軽い補正間引きで風通しを良くすると病気予防になります。",
  },
  {
    from: 51,
    to: 9999,
    text: "葉が7〜9枚、草丈25cm前後になれば収穫適期です。収穫が遅れると葉柄が固くなり、アクが強くなります。収穫は朝がおすすめです。葉の水分が多く、みずみずしさが長持ちします。",
  },
];

// --- Hook ---

export function useDailyEnvironment(plantName: string | undefined, selectedDate: Dayjs) {
  const [plantId, setPlantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [envData, setEnvData] = useState<EnvironmentData>({
    soilTemp: null,
    soilMoisture: null,
    roomTemp: null,
    roomHumid: null,
    light: null,
  });
  const [measuredAt, setMeasuredAt] = useState<string | null>(null);
  const [noDataMessage, setNoDataMessage] = useState<string | null>(null);

  const [soilTempDaily, setSoilTempDaily] = useState<DailyDataPoint[]>([]);
  const [soilMoistureDaily, setSoilMoistureDaily] = useState<DailyDataPoint[]>([]);
  const [roomTempDaily, setRoomTempDaily] = useState<DailyDataPoint[]>([]);
  const [roomHumidDaily, setRoomHumidDaily] = useState<DailyDataPoint[]>([]);
  const [lightDaily, setLightDaily] = useState<DailyDataPoint[]>([]);
  const [ecData, setEcData] = useState<EcData | null>(null);
  const [co2Daily, setCo2Daily] = useState<Co2DataPoint[]>([]);
  const [latestCo2, setLatestCo2] = useState<Co2DataPoint | null>(null);

  // --- Helpers ---
  const avg = (values: number[]) =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  // --- Fetchers ---

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

  const fetchEnvironmentData = useCallback(
    async (targetDate: Dayjs) => {
      if (!plantId) return;
      if (import.meta.env.VITE_USE_MOCK === "true") {
        setEnvData(generateMockEnvData());
        setMeasuredAt(dayjs().format("YYYY-MM-DD HH:mm:ss"));
        setNoDataMessage(null);
        return;
      }
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
          setEnvData({
            soilTemp: null,
            soilMoisture: null,
            roomTemp: null,
            roomHumid: null,
            light: null,
          });
          setMeasuredAt(null);
          setNoDataMessage(isToday ? "本日のデータはありません" : "該当時刻のデータはありません");
          return;
        }

        const record = data[0];
        setEnvData({
          soilTemp: record.soil_temp,
          soilMoisture: record.soil_moisture,
          roomTemp: record.room_temp,
          roomHumid: record.room_humid,
          light: record.light,
        });
        setMeasuredAt(record.measured_at);
        setNoDataMessage(null);
      } catch (err) {
        console.error("環境データ取得失敗:", err);
      }
    },
    [plantId],
  );

  const fetchDailySensorData = useCallback(
    async (
      targetDate: Dayjs,
      column: "soil_temp" | "soil_moisture" | "room_temp" | "room_humid" | "light",
      setter: React.Dispatch<React.SetStateAction<DailyDataPoint[]>>,
    ) => {
      if (!plantId) return;
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
        setter(generateMockDailyData(targetDate, min, max));
        return;
      }
      try {
        const base = targetDate.format("YYYY-MM-DD");
        const { data, error } = (await supabase
          .from("environment_measurements")
          .select(`measured_at, ${column}`)
          .eq("plant_id", plantId)
          .gte("measured_at", `${base} 00:00:00`)
          .lte("measured_at", `${base} 23:59:59`)
          .order("measured_at", { ascending: true })) as {
          data: EnvironmentRow[] | null;
          error: PostgrestError | null;
        };

        if (error) throw error;
        if (!data || data.length === 0) {
          setter([]);
          return;
        }

        const formatted = data
          .filter((row) => row[column] !== null)
          .map((row) => ({
            time: dayjs(row.measured_at.replace("+00", "")).format("HH:mm"),
            value: row[column] as number,
          }));
        setter(formatted);
      } catch (err) {
        console.error(`日内推移取得失敗 (${column}):`, err);
        setter([]);
      }
    },
    [plantId],
  );

  const fetchEcRowsByDate = useCallback(
    async (date: string) => {
      if (!plantId) return [];
      const { data } = await supabase
        .from("ec_measurements")
        .select("ec, tds, temperature, measured_at")
        .eq("plant_id", plantId)
        .gte("measured_at", `${date} 00:00:00`)
        .lte("measured_at", `${date} 23:59:59`);
      return (data ?? []) as EcRow[];
    },
    [plantId],
  );

  const fetchEcDataBySelectedDate = useCallback(
    async (targetDateStr: string) => {
      if (!plantId) return;
      if (import.meta.env.VITE_USE_MOCK === "true") {
        setEcData(generateMockEcData(targetDateStr));
        return;
      }
      let rows = await fetchEcRowsByDate(targetDateStr);

      if (rows.length === 0) {
        const { data } = await supabase
          .from("ec_measurements")
          .select("measured_at")
          .eq("plant_id", plantId)
          .lt("measured_at", `${targetDateStr} 00:00:00`)
          .order("measured_at", { ascending: false })
          .limit(1);

        if (!data || data.length === 0) {
          setEcData(null);
          return;
        }

        const latestDate = dayjs(data[0].measured_at).format("YYYY-MM-DD");
        rows = await fetchEcRowsByDate(latestDate);
        if (rows.length === 0) {
          setEcData(null);
          return;
        }
        targetDateStr = latestDate;
      }

      setEcData({
        ec: Math.round(avg(rows.map((r) => r.ec))),
        tds: Math.round(avg(rows.map((r) => r.tds))),
        temperature: Number(avg(rows.map((r) => r.temperature)).toFixed(1)),
        measuredAt: targetDateStr,
      });
    },
    [plantId, fetchEcRowsByDate],
  );

  const fetchLatestCo2Data = useCallback(
    async (targetDate: Dayjs) => {
      if (!plantId) return;
      if (import.meta.env.VITE_USE_MOCK === "true") {
        setLatestCo2({ time: dayjs().format("HH:mm"), value: 600 });
        return;
      }
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
      if (error || !data || data.length === 0) {
        setLatestCo2(null);
        return;
      }
      setLatestCo2({
        time: dayjs.utc(data[0].measured_at).format("HH:mm"),
        value: data[0].co2,
      });
    },
    [plantId],
  );

  const fetchDailyCo2Data = useCallback(
    async (targetDate: Dayjs) => {
      if (!plantId) return;
      if (import.meta.env.VITE_USE_MOCK === "true") {
        setCo2Daily(generateMockCo2Daily(targetDate));
        return;
      }
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
        if (!data || data.length === 0) {
          setCo2Daily([]);
          return;
        }

        const formatted: DailyDataPoint[] = data
          .filter((row: Co2Row) => row.co2 !== null)
          .map((row: Co2Row) => ({
            time: dayjs.utc(row.measured_at).format("HH:mm"),
            value: row.co2 as number,
          }));
        setCo2Daily(formatted);
      } catch (err) {
        console.error("CO2 日内データ取得失敗:", err);
        setCo2Daily([]);
      }
    },
    [plantId],
  );

  // --- Effects ---

  useEffect(() => {
    fetchPlantId();
  }, [fetchPlantId]);

  useEffect(() => {
    if (!plantId) return;
    setLoading(true);
    const loadAll = async () => {
      await Promise.all([
        fetchEnvironmentData(selectedDate),
        fetchDailySensorData(selectedDate, "soil_temp", setSoilTempDaily),
        fetchDailySensorData(selectedDate, "soil_moisture", setSoilMoistureDaily),
        fetchDailySensorData(selectedDate, "room_temp", setRoomTempDaily),
        fetchDailySensorData(selectedDate, "room_humid", setRoomHumidDaily),
        fetchDailySensorData(selectedDate, "light", setLightDaily),
        fetchEcDataBySelectedDate(selectedDate.format("YYYY-MM-DD")),
        fetchLatestCo2Data(selectedDate),
        fetchDailyCo2Data(selectedDate),
      ]);
      setLoading(false);
    };
    loadAll();
  }, [
    selectedDate,
    plantId,
    fetchEnvironmentData,
    fetchDailySensorData,
    fetchEcDataBySelectedDate,
    fetchLatestCo2Data,
    fetchDailyCo2Data,
  ]);

  // --- Computed Values ---

  const cultivationStart = dayjs("2025-12-08"); // TODO: Fetch from DB later
  const daysFromStart = selectedDate.diff(cultivationStart, "day");

  const adviceText = useMemo(() => {
    if (Number.isNaN(daysFromStart)) return null;
    if (daysFromStart < 0) return "栽培開始日より前の日付です。";
    const rule = KOMATSUNA_ADVICE_RULES.find(
      (r) => daysFromStart >= r.from && daysFromStart <= r.to,
    );
    return rule?.text ?? null;
  }, [daysFromStart]);

  return {
    plantId,
    loading,
    envData,
    measuredAt,
    noDataMessage,
    soilTempDaily,
    soilMoistureDaily,
    roomTempDaily,
    roomHumidDaily,
    lightDaily,
    ecData,
    co2Daily,
    latestCo2,
    adviceText,
    daysFromStart,
  };
}
