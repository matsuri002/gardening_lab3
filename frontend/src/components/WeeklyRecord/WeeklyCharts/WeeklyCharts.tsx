import { ResponsiveContainer, LineChart, XAxis, YAxis, Legend, Line, Tooltip } from "recharts";
import { Typography as MuiTypography, Box } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import SunnyIcon from "@mui/icons-material/Sunny";
import SpeedIcon from "@mui/icons-material/Speed";
import BoltIcon from "@mui/icons-material/Bolt";
import dayjs from "dayjs";
import DualModeChartCard from "../../DualModeChartCard";
import ChartCardFrame from "../../ChartCardFrame";
import type { useWeeklyEnvironment } from "../../../hooks/useWeeklyEnvironment/useWeeklyEnvironment";

type WeeklyChartsProps = {
  env: ReturnType<typeof useWeeklyEnvironment>;
};

export const WeeklyCharts = ({ env }: WeeklyChartsProps) => {
  const {
    xTicks7,
    xDomain7,
    komatsunaTempRange,
    soilTemp,
    soilMoisture,
    roomTemp,
    roomHumid,
    light,
    ecWeekly,
    co2Weekly,
  } = env;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* 土壌温度 */}
        <DualModeChartCard
          title="土壌温度の推移"
          icon={<ThermostatIcon sx={{ color: "#c1a185" }} />}
          mode={soilTemp.mode}
          onModeChange={soilTemp.setMode}
          rawData={soilTemp.raw}
          processedData={soilTemp.weekly}
          xTicks7={xTicks7}
          xDomain7={xDomain7}
          unit="°C"
          tooltipValueLabel="温度"
          tooltipUnitSuffix="°C"
          yDomainStandard={[(min) => Math.floor(min - 1), (max) => Math.ceil(max + 1)]}
          processedLines={[
            { key: "max", name: "最高温度", stroke: "#c18585" },
            { key: "avg", name: "平均温度", stroke: "#92c185" },
            { key: "min", name: "最低温度", stroke: "#85a5c1" },
          ]}
          referenceAreas={komatsunaTempRange}
          enableReferenceDomain
        />

        {/* 土壌水分量 */}
        <DualModeChartCard
          title="土壌水分量の推移"
          icon={<WaterDropIcon sx={{ color: "#85a5c1" }} />}
          mode={soilMoisture.mode}
          onModeChange={soilMoisture.setMode}
          rawData={soilMoisture.raw}
          processedData={soilMoisture.weekly}
          xTicks7={xTicks7}
          xDomain7={xDomain7}
          tooltipValueLabel="水分量"
          yDomainStandard={[(min) => Math.floor(min - 5), (max) => Math.ceil(max + 5)]}
          processedLines={[
            { key: "max", name: "最大値", stroke: "#c18585" },
            { key: "avg", name: "平均値", stroke: "#92c185" },
            { key: "min", name: "最小値", stroke: "#85a5c1" },
          ]}
          enableReferenceDomain={false}
        />
      </Box>

      <Box sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* 室内温度 */}
        <DualModeChartCard
          title="室内温度の推移"
          icon={<ThermostatIcon sx={{ color: "#c18585" }} />}
          mode={roomTemp.mode}
          onModeChange={roomTemp.setMode}
          rawData={roomTemp.raw}
          processedData={roomTemp.weekly}
          xTicks7={xTicks7}
          xDomain7={xDomain7}
          unit="°C"
          tooltipValueLabel="温度"
          tooltipUnitSuffix="°C"
          yDomainStandard={[(min) => Math.floor(min - 1), (max) => Math.ceil(max + 1)]}
          processedLines={[
            { key: "max", name: "最高温度", stroke: "#c18585" },
            { key: "avg", name: "平均温度", stroke: "#92c185" },
            { key: "min", name: "最低温度", stroke: "#85a5c1" },
          ]}
          referenceAreas={komatsunaTempRange}
          enableReferenceDomain
        />

        {/* 室内湿度 */}
        <DualModeChartCard
          title="室内湿度の推移"
          icon={<ThermostatIcon sx={{ color: "#85a5c1" }} />}
          mode={roomHumid.mode}
          onModeChange={roomHumid.setMode}
          rawData={roomHumid.raw}
          processedData={roomHumid.weekly}
          xTicks7={xTicks7}
          xDomain7={xDomain7}
          unit="%"
          tooltipValueLabel="湿度"
          tooltipUnitSuffix="%"
          yDomainStandard={[
            (min) => Math.max(0, Math.floor(min - 5)),
            (max) => Math.min(100, Math.ceil(max + 5)),
          ]}
          processedLines={[
            { key: "max", name: "最高湿度", stroke: "#c18585" },
            { key: "avg", name: "平均湿度", stroke: "#92c185" },
            { key: "min", name: "最低湿度", stroke: "#85a5c1" },
          ]}
          enableReferenceDomain={false}
        />
      </Box>

      <Box sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* 日射量 */}
        <DualModeChartCard
          title="日射量の推移"
          icon={<SunnyIcon sx={{ color: "#c18585" }} />}
          mode={light.mode}
          onModeChange={light.setMode}
          rawData={light.raw}
          processedData={light.weekly}
          xTicks7={xTicks7}
          xDomain7={xDomain7}
          unit="lux"
          tooltipValueLabel="日射量"
          tooltipUnitSuffix="lux"
          yDomainStandard={[
            (min) => Math.max(0, Math.floor(min - 50)),
            (max) => Math.ceil(max + 50),
          ]}
          enableReferenceDomain={false}
        />

        {/* CO2濃度 */}
        <ChartCardFrame title="CO₂濃度の推移" icon={<SpeedIcon sx={{ color: "#85a5c1" }} />}>
          {co2Weekly.length === 0 ? (
            <MuiTypography variant="body2" color="text.secondary">
              データがありません
            </MuiTypography>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={co2Weekly} margin={{ left: 10 }}>
                <XAxis
                  dataKey="ts"
                  type="number"
                  scale="time"
                  domain={xDomain7}
                  ticks={xTicks7}
                  tickFormatter={(ts: number) => dayjs(ts).format("MM/DD")}
                  interval={0}
                  tick={{ fontSize: 14 }}
                />
                <YAxis tick={{ fontSize: 14 }} unit="ppm" />
                <Tooltip labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")} />
                <Line dataKey="value" name="CO₂" stroke="#85a5c1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCardFrame>
      </Box>

      <Box sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* EC遷移 */}
        <ChartCardFrame
          title="EC値の推移（週次）"
          icon={<BoltIcon sx={{ color: "#c0c185" }} />}
          width={700}
        >
          {ecWeekly.length === 0 ? (
            <MuiTypography variant="body2" color="text.secondary">
              データがありません
            </MuiTypography>
          ) : (
            <Box sx={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ecWeekly} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <XAxis dataKey="date" />
                  <YAxis tick={{ fontSize: 14 }} unit="μS/cm" />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="ec" name="EC" stroke="#c0c185" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </ChartCardFrame>
      </Box>
    </Box>
  );
};
