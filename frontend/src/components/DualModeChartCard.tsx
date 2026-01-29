import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Line, Tooltip, Legend, ReferenceArea } from "recharts";
import dayjs from "dayjs";
import ViewModeToggle, { type ViewMode } from "./ViewModeToggle";

export type RawPoint = { ts: number; value: number };
export type WeeklyStatPoint = { date: string; max: number; min: number; avg: number };

type ProcessedLineConfig = {
  key: "max" | "avg" | "min";
  name: string;
  stroke: string;
};

type Props = {
  title: string;
  icon: React.ReactNode;

  /** Toggle */
  mode: ViewMode;
  onModeChange: (next: ViewMode) => void;

  /** Data */
  rawData: RawPoint[];
  processedData: WeeklyStatPoint[];

  /** X axis (standard) */
  xTicks7: number[];
  xDomain7: [number, number];

  /** Y axis */
  unit?: string; // 例: "°C", "%", "lux"
  yDomainStandard?: [(min: number) => number, (max: number) => number];
  yDomainProcessed?: [(min: number) => number, (max: number) => number];

  /** Tooltip */
  tooltipValueLabel?: string; // 例: "温度", "湿度", "日射量", "水分量"
  tooltipUnitSuffix?: string; // 例: "°C", "%", "lux"（表示したい場合だけ）

  /** Processed lines */
  processedLines?: ProcessedLineConfig[];

  /** Style */
  cardSx?: any;
  chartMargin?: { top?: number; right?: number; bottom?: number; left?: number };

  referenceAreas?: {
    y1: number;
    y2: number;
    label: string;
    fill: string;
  }[];

  enableReferenceDomain?: boolean;
};

const defaultProcessedLines: ProcessedLineConfig[] = [
  { key: "max", name: "最大値", stroke: "#c18585" },
  { key: "avg", name: "平均値", stroke: "#92c185" },
  { key: "min", name: "最小値", stroke: "#85a5c1" },
];

export default function DualModeChartCard({
  title,
  icon,
  mode,
  onModeChange,
  rawData,
  processedData,
  xTicks7,
  xDomain7,
  unit,
  processedLines = defaultProcessedLines,
  cardSx,
  chartMargin = { right: 20, left: 20 },
  referenceAreas,
  enableReferenceDomain
}: Props) {
  const isStandard = mode === "standard";
  const empty = isStandard ? rawData.length === 0 : processedData.length === 0;
  const referenceMin = referenceAreas
   ? Math.min(...referenceAreas.map(r => r.y1))
   : Infinity;

  const referenceMax = referenceAreas
   ? Math.max(...referenceAreas.map(r => r.y2))
   : -Infinity;

  // standard（時系列）
  const dataValuesStandard = rawData
   .map(d => Number(d.value))
   .filter(v => !isNaN(v));

  // processed（集計）
  const dataValuesProcessed = processedData.flatMap(d =>
    processedLines
     .map(l => Number(d[l.key]))
     .filter(v => !isNaN(v))
  );

  const computedDomainStandard: [number, number] = [
   Math.min(...dataValuesStandard, referenceMin),
   Math.max(...dataValuesStandard, referenceMax),
  ];

  const computedDomainProcessed: [number, number] = [
   Math.min(...dataValuesProcessed, referenceMin),
   Math.max(...dataValuesProcessed, referenceMax),
  ];

  const enableRef = enableReferenceDomain && referenceAreas?.length;

  const yDomainStandardFinal = enableRef
    ? computedDomainStandard
    : ['auto', 'auto'];

  const yDomainProcessedFinal = enableRef
    ? computedDomainProcessed
    : ['auto', 'auto'];


  return (
    <Card sx={{ width: "700px", borderRadius: 3, boxShadow: 3, p: 1, ...cardSx }}>
      <CardContent>
        <Stack spacing={1} sx={{ width: "100%" }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {icon}
              <Typography variant="subtitle1" color="text.primary">
                {title}
              </Typography>
            </Stack>
            <ViewModeToggle value={mode} onChange={onModeChange} />
          </Stack>

          {/* Body */}
          {empty ? (
            <Typography variant="body2" color="text.secondary">
              データがありません
            </Typography>
          ) : isStandard ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={rawData} margin={chartMargin}>
                <XAxis
                  dataKey="ts"
                  type="number"
                  scale="time"
                  domain={xDomain7}
                  ticks={xTicks7}
                  tickFormatter={(ts: number) => dayjs(ts).format("MM/DD")}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  unit={unit}
                  domain={isStandard ? yDomainStandardFinal : yDomainProcessedFinal}
                />

                {referenceAreas?.map((r, i) => (
                    <ReferenceArea
                    key={i}
                    y1={r.y1}
                    y2={r.y2}
                    fill={r.fill}
                    fillOpacity={0.15}
                    label={{ value: r.label, position: "insideTopRight", fontSize: 12 }}
                    />
                ))}
                {/* 重要：ticks を固定しても全点で出したい場合は trigger="item" が安定 */}
                <Tooltip
                  labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")}
                />
                <Line dataKey="value" stroke="#85a5c1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={processedData} margin={chartMargin}>
                <XAxis dataKey="date" />
                <YAxis
                  unit={unit}
                  domain={isStandard ? yDomainStandardFinal : yDomainProcessedFinal}
                />

                {referenceAreas?.map((r, i) => (
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
                <Legend />
                {processedLines.map((l) => (
                  <Line
                    key={l.key}
                    dataKey={l.key}
                    name={l.name}
                    stroke={l.stroke}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
