import { useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { getEnvironmentRepository, getPlantsRepository } from "../../api";
import type { Co2DataPoint, DailyDataPoint, EcData, EnvironmentData } from "../../api/types";

export type { Co2DataPoint, DailyDataPoint, EcData, EnvironmentData };

type AdviceRule = {
  from: number;
  to: number;
  text: string;
};

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

  useEffect(() => {
    let cancelled = false;

    const resolvePlantId = async () => {
      if (!plantName) {
        setPlantId(null);
        return;
      }
      const id = await getPlantsRepository().getPlantIdByName(plantName);
      if (!cancelled && id) setPlantId(id);
    };

    resolvePlantId();
    return () => {
      cancelled = true;
    };
  }, [plantName]);

  useEffect(() => {
    if (!plantId) return;

    let cancelled = false;
    const repo = getEnvironmentRepository();
    const dateStr = selectedDate.format("YYYY-MM-DD");

    const loadAll = async () => {
      setLoading(true);
      const [snapshot, soilTemp, soilMoisture, roomTemp, roomHumid, light, ec, latest, co2] =
        await Promise.all([
          repo.getEnvironmentSnapshot(plantId, selectedDate),
          repo.getDailySensorSeries(plantId, selectedDate, "soil_temp"),
          repo.getDailySensorSeries(plantId, selectedDate, "soil_moisture"),
          repo.getDailySensorSeries(plantId, selectedDate, "room_temp"),
          repo.getDailySensorSeries(plantId, selectedDate, "room_humid"),
          repo.getDailySensorSeries(plantId, selectedDate, "light"),
          repo.getEcDataForDate(plantId, dateStr),
          repo.getLatestCo2(plantId, selectedDate),
          repo.getDailyCo2Series(plantId, selectedDate),
        ]);

      if (cancelled) return;

      setEnvData(snapshot.envData);
      setMeasuredAt(snapshot.measuredAt);
      setNoDataMessage(snapshot.noDataMessage);
      setSoilTempDaily(soilTemp);
      setSoilMoistureDaily(soilMoisture);
      setRoomTempDaily(roomTemp);
      setRoomHumidDaily(roomHumid);
      setLightDaily(light);
      setEcData(ec);
      setLatestCo2(latest);
      setCo2Daily(co2);
      setLoading(false);
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, plantId]);

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
