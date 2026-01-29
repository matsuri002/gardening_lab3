import { Typography, Box, Container, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ThermostatIcon from '@mui/icons-material/Thermostat'
import SunnyIcon from '@mui/icons-material/Sunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Legend, Line, Tooltip } from 'recharts';
import RecordTabs from '../components/Tab';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { useParams } from 'react-router-dom';
import DualModeChartCard from '../components/DualModeChartCard';
import ChartCardFrame from '../components/ChartCardFrame';

export default function WeeklyRecordPageContainer() {

  type WeeklyStatPoint = {
    date: string;
    max: number;    
    min: number;
    avg: number;
  };

  type EcWeeklyPoint = {
    date: string;
    ec: number;
    tds: number;
    temperature: number;
  };

  type Co2WeeklyPoint = {
    ts: number;          // 追加: UNIX ms
    datetime: string;    // 表示用の整形文字列（Tooltipで使ってもOK）
    value: number;
  };

  type RawPoint = {
    ts: number;
    value: number;
  };
  
  const { plantType } = useParams<{
    plantType: string;
  }>();

  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs());
  const [soilTempWeekly, setSoilTempWeekly] = useState<WeeklyStatPoint[]>([]);
  const [roomTempWeekly, setRoomTempWeekly] = useState<WeeklyStatPoint[]>([]);
  const [roomHumidWeekly, setRoomHumidWeekly] = useState<WeeklyStatPoint[]>([]);
  const [soilMoistureWeekly, setSoilMoistureWeekly] = useState<WeeklyStatPoint[]>([]);
  const [lightWeekly, setLightWeekly] = useState<WeeklyStatPoint[]>([]);
  const [ecWeekly, setEcWeekly] = useState<EcWeeklyPoint[]>([]);
  const [co2Weekly, setCo2Weekly] = useState<Co2WeeklyPoint[]>([]);

  const fetchWeeklyStats = async (
    endDate: dayjs.Dayjs,
    column:
      | 'soil_temp'
      | 'room_temp'
      | 'room_humid'
      | 'soil_moisture'
      | 'light'
  ): Promise<WeeklyStatPoint[]> => {
    const end = endDate.endOf('day');
    const start = end.subtract(6, 'day').startOf('day');

    const { data, error } = await supabase
      .from('environment_measurements')
      .select(`measured_at, ${column}`)
      .eq('plant_id', 'd5961b2c-fd83-4ccf-a3da-709e9aca6945')
      .gte('measured_at', start.format('YYYY-MM-DD HH:mm:ss'))
      .lte('measured_at', end.format('YYYY-MM-DD HH:mm:ss'));

    if (error || !data) return [];

    // 日付ごとにまとめる
    const grouped: Record<string, number[]> = {};

    data.forEach((row: any) => {
      if (row[column] == null) return;

      const date = dayjs(row.measured_at.replace('+00', '')).format('MM/DD');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(Number(row[column]));
    });

    return Object.entries(grouped).map(([date, values]) => {
      const max = Math.max(...values);
      const min = Math.min(...values);
      const avg =
        values.reduce((a, b) => a + b, 0) / values.length;

      return {
        date,
        max: Number(max.toFixed(1)),
        avg: Number(avg.toFixed(1)),
        min: Number(min.toFixed(1)),
      };
    });
  };

  const fetchWeeklyRawData = async (
    endDate: dayjs.Dayjs,
    column:
      | 'soil_temp'
      | 'room_temp'
      | 'room_humid'
      | 'soil_moisture'
      | 'light'
  ): Promise<RawPoint[]> => {
    const end = endDate.endOf('day');
    const start = end.subtract(6, 'day').startOf('day');

    const { data, error } = await supabase
      .from('environment_measurements')
      .select(`measured_at, ${column}`)
      .eq('plant_id', 'd5961b2c-fd83-4ccf-a3da-709e9aca6945')
      .gte('measured_at', start.format('YYYY-MM-DD HH:mm:ss'))
      .lte('measured_at', end.format('YYYY-MM-DD HH:mm:ss'))
      .order('measured_at', { ascending: true });

    if (error || !data) return [];

    return data
      .filter((row: any) => row[column] != null)
      .map((row: any) => {
        const m = dayjs(row.measured_at.replace('+00', ''));
        return { ts: m.valueOf(), value: Number(row[column]) };
      });
  };

  type ViewMode = 'standard' | 'processed';

  const [soilTempMode, setSoilTempMode] = useState<ViewMode>('standard');
  const [soilMoistureMode, setSoilMoistureMode] = useState<ViewMode>('standard');
  const [roomTempMode, setRoomTempMode] = useState<ViewMode>('standard');
  const [roomHumidMode, setRoomHumidMode] = useState<ViewMode>('standard');
  const [lightMode, setLightMode] = useState<ViewMode>('processed');

  // 生データ state（時系列表示用）
  const [soilTempRaw, setSoilTempRaw] = useState<RawPoint[]>([]);
  const [soilMoistureRaw, setSoilMoistureRaw] = useState<RawPoint[]>([]);
  const [roomTempRaw, setRoomTempRaw] = useState<RawPoint[]>([]);
  const [roomHumidRaw, setRoomHumidRaw] = useState<RawPoint[]>([]);
  const [lightRaw, setLightRaw] = useState<RawPoint[]>([]);

  const xTicks7 = useMemo(() => {
    const end = endDate.startOf('day'); // 最終日の 00:00
    const start = end.subtract(6, 'day'); // 6日前の 00:00
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').valueOf());
  }, [endDate]);
  
  const xDomain7: [number, number] = useMemo(() => {
    // 7日目の終わりまで表示（最終日の 23:59:59.999）
    const end = xTicks7[6] + 24 * 60 * 60 * 1000 - 1;
    return [xTicks7[0], end];
  }, [xTicks7]);

  const fetchEcWeeklyData = async () => {
    try {
      // plant_id を指定して全期間の EC データを取得
      const { data, error } = await supabase
        .from("ec_measurements")
        .select(`ec, tds, temperature, measured_at`)
        .eq("plant_id", "d5961b2c-fd83-4ccf-a3da-709e9aca6945")
        .order("measured_at", { ascending: true });

      if (error || !data) {
        console.error("ECデータ取得失敗:", error);
        setEcWeekly([]);
        return;
      }

      // 日付ごとにグループ化して平均を計算
      const grouped: Record<string, EcWeeklyPoint[]> = {};

      data.forEach((row: any) => {
        if (row.ec == null) return;

        const date = dayjs(row.measured_at.replace("+00", "")).format("MM/DD");
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({
          date,
          ec: Number(row.ec),
          tds: Number(row.tds),
          temperature: Number(row.temperature),
        });
      });

      // 日付ごとの平均を算出
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
  };

  const fetchWeeklyCo2Data = async (endDate: dayjs.Dayjs) => {
    try {
      const end = endDate.endOf("day");
      const start = end.subtract(6, "day").startOf("day");

      const { data, error } = await supabase
        .from("co2_measurements")
        .select("measured_at, co2")
        .eq("plant_id", "d5961b2c-fd83-4ccf-a3da-709e9aca6945")
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
          // ※ measured_at がUTCならタイムゾーン注意。今は既存の replace を踏襲
          const m = dayjs(row.measured_at.replace("+00", ""));
          return {
            ts: m.valueOf(),                          // ← X軸の実値として使う
            datetime: m.format("YYYY/MM/DD HH:mm"),   // ← Tooltip 表示用
            value: Number(row.co2),
          };
        });

      setCo2Weekly(formatted);
    } catch (err) {
      console.error("CO₂週次データ取得失敗:", err);
      setCo2Weekly([]);
    }
  };

  useEffect(() => {
    if (!endDate) return;
    if (soilTempMode === 'standard') {
      fetchWeeklyRawData(endDate, 'soil_temp').then(setSoilTempRaw);
    } else {
      fetchWeeklyStats(endDate, 'soil_temp').then(setSoilTempWeekly);
    }
    if (soilMoistureMode === 'standard') {
      fetchWeeklyRawData(endDate, 'soil_moisture').then(setSoilMoistureRaw);
    } else {
      fetchWeeklyStats(endDate, 'soil_moisture').then(setSoilMoistureWeekly);
    }
    if (roomTempMode === 'standard') {
      fetchWeeklyRawData(endDate, 'room_temp').then(setRoomTempRaw);
    } else {
      fetchWeeklyStats(endDate, 'room_temp').then(setRoomTempWeekly);
    }
    if (roomHumidMode === 'standard') {
      fetchWeeklyRawData(endDate, 'room_humid').then(setRoomHumidRaw);
    } else {
      fetchWeeklyStats(endDate, 'room_humid').then(setRoomHumidWeekly);
    }
    if (lightMode === 'standard') {
      fetchWeeklyRawData(endDate, 'light').then(setLightRaw);
    } else {
      fetchWeeklyStats(endDate, 'light').then(setLightWeekly);
    }
    fetchEcWeeklyData();
    fetchWeeklyCo2Data(endDate);

  }, [endDate, soilTempMode, soilMoistureMode, roomTempMode, roomHumidMode, lightMode]);

  return (
    <Box 
      sx={{
        position: 'fixed',
        inset: 0,           
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* ヘッダー */}
      <Header />

      {/* タブ - 1週間の記録を選択 */}
      <Stack direction="row" spacing={15} alignItems="center">
        <RecordTabs />
        {plantType && (
          <BackButton to={`/select-planter/${plantType}`} />
        )}
      </Stack>

      {/* メイン */}
      <Box component='main' sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}
        >          
          {/* 日付選択 */}    
          {/* TODO: デフォルトで今日の日付から7日前までのデータを表示 */}      
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* 日付を選択し、選択した日付から7日前までのデータを表示する */}
            <DatePicker
              label="最終日を選択"
              value={endDate}
              onChange={(newValue) => {
                if (newValue) setEndDate(newValue);
              }}
            />
          </LocalizationProvider>
          <Typography variant='subtitle1' color='text.primary'>過去7日間の推移</Typography>  
          <Typography variant="body2" color="text.secondary">
            {endDate.subtract(6, 'day').format('MM/DD')}～
            {endDate.format('MM/DD')}
          </Typography>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 土壌温度7日間推移 */}
            <DualModeChartCard
              title="土壌温度の推移"
              icon={<ThermostatIcon sx={{ color: "#c1a185" }} />}
              mode={soilTempMode}
              onModeChange={setSoilTempMode}
              rawData={soilTempRaw}
              processedData={soilTempWeekly}
              xTicks7={xTicks7}
              xDomain7={xDomain7}
              unit="°C"
              tooltipValueLabel="温度"
              tooltipUnitSuffix="°C"
              yDomainStandard={[
                (min) => Math.floor(min - 1),
                (max) => Math.ceil(max + 1),
              ]}
              processedLines={[
                { key: "max", name: "最高温度", stroke: "#c18585" },
                { key: "avg", name: "平均温度", stroke: "#92c185" },
                { key: "min", name: "最低温度", stroke: "#85a5c1" },
              ]}
            />

            {/* 土壌水分量7日間推移 */}
            {/* 表示方法（アナログ値or%）は要検討 */}
            <DualModeChartCard
              title="土壌水分量の推移"
              icon={<WaterDropIcon sx={{ color: "#85a5c1" }} />}
              mode={soilMoistureMode}
              onModeChange={setSoilMoistureMode}
              rawData={soilMoistureRaw}
              processedData={soilMoistureWeekly}
              xTicks7={xTicks7}
              xDomain7={xDomain7}
              tooltipValueLabel="水分量"
              yDomainStandard={[
                (min) => Math.floor(min - 5),
                (max) => Math.ceil(max + 5),
              ]}
              processedLines={[
                { key: "max", name: "最大値", stroke: "#c18585" },
                { key: "avg", name: "平均値", stroke: "#92c185" },
                { key: "min", name: "最小値", stroke: "#85a5c1" },
              ]}
            />
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 室内温度7日間推移 */}
            <DualModeChartCard
              title="室内温度の推移"
              icon={<ThermostatIcon sx={{ color: "#c18585" }} />}
              mode={roomTempMode}
              onModeChange={setRoomTempMode}
              rawData={roomTempRaw}
              processedData={roomTempWeekly}
              xTicks7={xTicks7}
              xDomain7={xDomain7}
              unit="°C"
              tooltipValueLabel="温度"
              tooltipUnitSuffix="°C"
              yDomainStandard={[
                (min) => Math.floor(min - 1),
                (max) => Math.ceil(max + 1),
              ]}
              processedLines={[
                { key: "max", name: "最高温度", stroke: "#c18585" },
                { key: "avg", name: "平均温度", stroke: "#92c185" },
                { key: "min", name: "最低温度", stroke: "#85a5c1" },
              ]}
            />

            {/* 室内湿度7日間推移 */}
            <DualModeChartCard
              title="室内湿度の推移"
              icon={<ThermostatIcon sx={{ color: "#85a5c1" }} />}
              mode={roomHumidMode}
              onModeChange={setRoomHumidMode}
              rawData={roomHumidRaw}
              processedData={roomHumidWeekly}
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
            />
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 日射量7日間推移 */}
            <DualModeChartCard
              title="日射量の推移"
              icon={<SunnyIcon sx={{ color: "#c18585" }} />}
              mode={lightMode}
              onModeChange={setLightMode}
              rawData={lightRaw}
              processedData={lightWeekly}
              xTicks7={xTicks7}
              xDomain7={xDomain7}
              unit="lux"
              tooltipValueLabel="日射量"
              tooltipUnitSuffix="lux"
              yDomainStandard={[
                (min) => Math.max(0, Math.floor(min - 50)),
                (max) => Math.ceil(max + 50),
              ]}
            />

            {/* CO2濃度7日間遷移 */}
            <ChartCardFrame
              title="CO₂濃度の推移"
              icon={<SpeedIcon sx={{ color: "#85a5c1" }} />}
            >
              {co2Weekly.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  データがありません
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={co2Weekly} margin={{ left: 10 }}>
                    <XAxis
                      dataKey="ts"
                      type="number"
                      scale="time"
                      domain={xDomain7} // ← 可能なら統一（7日終端まで）
                      ticks={xTicks7}
                      tickFormatter={(ts: number) => dayjs(ts).format("MM/DD")}
                      interval={0}
                      tick={{ fontSize: 14 }}
                    />
                    <YAxis tick={{ fontSize: 14 }} unit="ppm" />
                    <Tooltip
                      labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")}
                    />
                    <Line dataKey="value" name="CO₂" stroke="#85a5c1" strokeWidth={2} dot={false} />
                    {/* 日平均線を入れるならここに Line を追加 */}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCardFrame>
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* EC遷移 */}
            <ChartCardFrame
              title="EC値の推移（週次）"
              icon={<BoltIcon sx={{ color: "#c0c185" }} />}
              width={700}
            >
              {ecWeekly.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  データがありません
                </Typography>
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

        </Container>
      </Box>
    </Box>
  );
}

