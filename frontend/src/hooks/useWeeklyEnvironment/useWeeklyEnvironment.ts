import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { getEnvironmentRepository, getPlantsRepository } from "../../api";
import type { EcWeeklyPoint, Co2WeeklyPoint, RawPoint, WeeklyStatPoint } from "../../api/types";

export type { Co2WeeklyPoint, EcWeeklyPoint, RawPoint, WeeklyStatPoint };

export type ViewMode = "standard" | "processed";

export const useWeeklyEnvironment = (plantName: string | undefined) => {
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs());
  const [plantId, setPlantId] = useState<string | null>(null);

  const [soilTempMode, setSoilTempMode] = useState<ViewMode>("standard");
  const [soilMoistureMode, setSoilMoistureMode] = useState<ViewMode>("standard");
  const [roomTempMode, setRoomTempMode] = useState<ViewMode>("standard");
  const [roomHumidMode, setRoomHumidMode] = useState<ViewMode>("standard");
  const [lightMode, setLightMode] = useState<ViewMode>("processed");

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
    if (!endDate || !plantId) return;

    let cancelled = false;
    const repo = getEnvironmentRepository();

    const loadSensor = async (
      mode: ViewMode,
      column: "soil_temp" | "soil_moisture" | "room_temp" | "room_humid" | "light",
      setRaw: (data: RawPoint[]) => void,
      setWeekly: (data: WeeklyStatPoint[]) => void,
    ) => {
      if (mode === "standard") {
        setRaw(await repo.getWeeklyRawSeries(plantId, endDate, column));
      } else {
        setWeekly(await repo.getWeeklyStats(plantId, endDate, column));
      }
    };

    const loadAll = async () => {
      await Promise.all([
        loadSensor(soilTempMode, "soil_temp", setSoilTempRaw, setSoilTempWeekly),
        loadSensor(soilMoistureMode, "soil_moisture", setSoilMoistureRaw, setSoilMoistureWeekly),
        loadSensor(roomTempMode, "room_temp", setRoomTempRaw, setRoomTempWeekly),
        loadSensor(roomHumidMode, "room_humid", setRoomHumidRaw, setRoomHumidWeekly),
        loadSensor(lightMode, "light", setLightRaw, setLightWeekly),
      ]);

      if (cancelled) return;

      const [ec, co2] = await Promise.all([
        repo.getEcWeeklySeries(plantId, endDate),
        repo.getCo2WeeklySeries(plantId, endDate),
      ]);

      if (cancelled) return;

      setEcWeekly(ec);
      setCo2Weekly(co2);
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [plantId, endDate, soilTempMode, soilMoistureMode, roomTempMode, roomHumidMode, lightMode]);

  const xTicks7 = useMemo(() => {
    const end = endDate.startOf("day");
    const start = end.subtract(6, "day");
    return Array.from({ length: 7 }, (_, i) => start.add(i, "day").valueOf());
  }, [endDate]);

  const xDomain7: [number, number] = useMemo(() => {
    const end = xTicks7[6] + 24 * 60 * 60 * 1000 - 1;
    return [xTicks7[0], end];
  }, [xTicks7]);

  const cultivationStart = dayjs("2025-12-08");
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
