import { Box, Typography, Card, CardContent, Avatar, Stack } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import SunnyIcon from "@mui/icons-material/Sunny";
import BoltIcon from "@mui/icons-material/Bolt";
import dayjs from "dayjs";
import type { EnvironmentData, EcData, Co2DataPoint } from "../../hooks/useDailyEnvironment";

type Props = {
  envData: EnvironmentData;
  ecData: EcData | null;
  latestCo2: Co2DataPoint | null;
  measuredAt: string | null;
  noDataMessage: string | null;
};

export default function EnvironmentSummary({
  envData,
  ecData,
  latestCo2,
  measuredAt,
  noDataMessage,
}: Props) {
  const renderValue = (value: number | null | undefined, unit: string) => {
    return value != null ? `${value}${unit}` : "--";
  };

  return (
    <Box sx={{ p: 2 }}>
      {measuredAt && !noDataMessage && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {dayjs(measuredAt.replace("+00", "")).format("YYYY/MM/DD HH:mm")} 時点
        </Typography>
      )}
      {noDataMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {noDataMessage}
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 2,
        }}
      >
        <SummaryCard
          title="土壌温度"
          value={renderValue(envData.soilTemp, "°C")}
          icon={<ThermostatIcon />}
          color="#c18585"
        />
        <SummaryCard
          title="土壌水分量"
          value={renderValue(envData.soilMoisture, "%")}
          icon={<WaterDropIcon />}
          color="#85abc1"
        />
        <SummaryCard
          title="室内温度"
          value={renderValue(envData.roomTemp, "°C")}
          icon={<ThermostatIcon />}
          color="#c1a785"
        />
        <SummaryCard
          title="室内湿度"
          value={renderValue(envData.roomHumid, "%")}
          icon={<WaterDropIcon />}
          color="#85c1a7"
        />
        <SummaryCard
          title="日射量"
          value={renderValue(envData.light, " lux")}
          icon={<SunnyIcon />}
          color="#c1c185"
        />
        <SummaryCard
          title="EC値"
          value={ecData ? `${ecData.ec} μS/cm` : "--"}
          subValue={ecData ? `TDS: ${ecData.tds} ppm` : undefined}
          icon={<BoltIcon />}
          color="#a785c1"
        />
        <SummaryCard
          title="CO2濃度"
          value={latestCo2 ? `${latestCo2.value} ppm` : "--"}
          icon={<BoltIcon />} // TODO: Replace with proper icon if needed
          color="#92c185"
        />
      </Box>
    </Box>
  );
}

type CardProps = {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
};

function SummaryCard({ title, value, subValue, icon, color }: CardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>{icon}</Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {title}
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
              {value}
            </Typography>
            {subValue && (
              <Typography variant="caption" color="text.secondary">
                {subValue}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
