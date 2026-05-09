import { Box, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import SunnyIcon from "@mui/icons-material/Sunny";
import SpeedIcon from "@mui/icons-material/Speed";
import ChartCardFrame from "../../ChartCardFrame";
import type { DailyDataPoint, Co2DataPoint } from "../../../hooks/useDailyEnvironment/useDailyEnvironment";

type Props = {
  soilTempDaily: DailyDataPoint[];
  soilMoistureDaily: DailyDataPoint[];
  roomTempDaily: DailyDataPoint[];
  roomHumidDaily: DailyDataPoint[];
  lightDaily: DailyDataPoint[];
  co2Daily: Co2DataPoint[];
  daysFromStart: number;
};

export default function DailyCharts({
  soilTempDaily,
  soilMoistureDaily,
  roomTempDaily,
  roomHumidDaily,
  lightDaily,
  co2Daily,
  daysFromStart,
}: Props) {
  // 適温範囲の計算
  const isGermination = daysFromStart <= 10;
  const komatsunaTempRange = isGermination
    ? [{ y1: 20, y2: 25, label: "発芽適温", fill: "#c18585" }]
    : [{ y1: 15, y2: 25, label: "生育適温", fill: "#92c185" }];

  // 室内温湿度の統合データ作成
  const roomTHDaily = roomTempDaily.map((tempRow) => {
    const humidRow = roomHumidDaily.find((h) => h.time === tempRow.time);
    return {
      time: tempRow.time,
      temp: tempRow.value,
      humid: humidRow ? humidRow.value : null,
    };
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      {/* 土壌温度・水分量 */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <ChartCardFrame
          title="土壌温度の推移"
          icon={<ThermostatIcon sx={{ color: "#c1a185" }} />}
          sx={{ flex: 1, minWidth: 300 }}
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={soilTempDaily}>
              <XAxis dataKey="time" />
              <YAxis
                unit="°C"
                domain={[
                  0,
                  Math.max(
                    ...soilTempDaily.map((d) => d.value),
                    ...komatsunaTempRange.map((r) => r.y2),
                    30,
                  ),
                ]}
              />
              {komatsunaTempRange.map((r, i) => (
                <ReferenceArea
                  key={i}
                  y1={r.y1}
                  y2={r.y2}
                  fill={r.fill}
                  fillOpacity={0.15}
                  label={{ value: r.label, position: "insideTopRight", fontSize: 12 }}
                />
              ))}
              <Tooltip />
              <Line dataKey="value" stroke="#c1a185" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCardFrame>

        <ChartCardFrame
          title="土壌水分量の推移"
          icon={<WaterDropIcon sx={{ color: "#85a5c1" }} />}
          sx={{ flex: 1, minWidth: 300 }}
        >
          {soilMoistureDaily.length === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={soilMoistureDaily}>
                <XAxis dataKey="time" />
                <YAxis unit="%" />
                <Tooltip />
                <Line dataKey="value" name="土壌水分量" stroke="#85a5c1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCardFrame>
      </Box>

      {/* 室内温湿度・日射量 */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <ChartCardFrame
          title="室内温湿度の推移"
          icon={<ThermostatIcon sx={{ color: "#A395A3" }} />}
          sx={{ flex: 1, minWidth: 300 }}
        >
          {roomTHDaily.length === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roomTHDaily}>
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" unit="°C" domain={[0, 40]} />
                <YAxis yAxisId="right" orientation="right" unit="%" />
                {komatsunaTempRange.map((r, i) => (
                  <ReferenceArea
                    key={i}
                    yAxisId="left"
                    y1={r.y1}
                    y2={r.y2}
                    fill={r.fill}
                    fillOpacity={0.15}
                    label={{ value: r.label, position: "insideTopRight", fontSize: 12 }}
                  />
                ))}
                <Tooltip />
                <Legend />
                <Line yAxisId="left" dataKey="temp" name="室内温度" stroke="#c18585" strokeWidth={2} dot={false} />
                <Line yAxisId="right" dataKey="humid" name="室内湿度" stroke="#85a5c1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCardFrame>

        <ChartCardFrame
          title="日射量の推移"
          icon={<SunnyIcon sx={{ color: "#c18585" }} />}
          sx={{ flex: 1, minWidth: 300 }}
        >
          {lightDaily.length === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lightDaily}>
                <XAxis dataKey="time" />
                <YAxis unit="lux" />
                <Tooltip />
                <Line dataKey="value" name="日射量" stroke="#c18585" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCardFrame>
      </Box>

      {/* CO2濃度 */}
      <Box>
        <ChartCardFrame
          title="CO₂濃度の推移"
          icon={<SpeedIcon sx={{ color: "#85a5c1" }} />}
          sx={{ maxWidth: 700 }}
        >
          {co2Daily.length === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={co2Daily} margin={{ right: 30, left: 30 }}>
                <XAxis dataKey="time" />
                <YAxis unit="ppm" />
                <Tooltip />
                <Line dataKey="value" name="CO₂" stroke="#85a5c1" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCardFrame>
      </Box>
    </Box>
  );
}

function NoData() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 250 }}>
      <Typography variant="body2" color="text.secondary">
        データがありません
      </Typography>
    </Box>
  );
}
