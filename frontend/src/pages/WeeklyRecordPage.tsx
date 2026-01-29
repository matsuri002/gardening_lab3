import {
  Typography, Box, Container,
  Card,
  CardContent,
  Stack,
  } from '@mui/material';
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
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

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

 // co2日平均
  // const { co2DailyAvg } = useMemo(() => {
  //   if (co2Weekly.length === 0) {
  //     return { co2DailyAvg: [] as { ts: number; avg: number }[], dailyAvgMap: new Map<string, number>() };
  //   }

  //   const groups = new Map<string, number[]>();
  //   for (const p of co2Weekly) {
  //     const dayKey = dayjs(p.ts).format('YYYY-MM-DD');
  //     if (!groups.has(dayKey)) groups.set(dayKey, []);
  //     groups.get(dayKey)!.push(p.value);
  //   }

  //   const co2DailyAvg = Array.from(groups.entries()).map(([dayKey, arr]) => {
  //     const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  //     return {
  //       ts: dayjs(dayKey + ' 00:00').valueOf(),
  //       avg: Number(avg.toFixed(0)), // 小数不要なら丸め
  //     };
  //   }).sort((a, b) => a.ts - b.ts);

  //   const dailyAvgMap = new Map(co2DailyAvg.map(d => [dayjs(d.ts).format('YYYY-MM-DD'), d.avg]));

  //   return { co2DailyAvg, dailyAvgMap };
  // }, [co2Weekly]);

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

          {/* TODO: 各グラフにスクロールバーを付ける */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 土壌温度7日間推移 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            <Card sx={{ width: '500px', borderRadius: 3, boxShadow: 3, p: 1 }}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  {/* タイトル行 + ボタン */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center">
                      <ThermostatIcon sx={{ color: '#c1a185' }} />
                      <Typography variant="subtitle1" color="text.primary">
                        土壌温度の推移
                      </Typography>
                    </Stack>

                    <ToggleButtonGroup
                      size="small"
                      value={soilTempMode}
                      exclusive
                      onChange={(_, v) => v && setSoilTempMode(v)}
                    >
                      <ToggleButton value="standard">時系列</ToggleButton>
                      <ToggleButton value="processed">集計</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  {/* 本体 */}
                  {soilTempMode === 'standard' ? (
                    soilTempRaw.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={soilTempRaw} margin={{ right: 20, left: 10 }}>
                          <XAxis
                            dataKey="ts"
                            type="number"
                            scale="time"
                            domain={[xTicks7[0], xTicks7[6] + 24 * 60 * 60 * 1000 - 1]} // 7日分（最終日の終わりまで）
                            ticks={xTicks7}
                            tickFormatter={(ts: number) => dayjs(ts).format("MM/DD")}
                            interval={0} 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            unit="°C"
                            domain={[
                              (min: number) => Math.floor(min - 1),
                              (max: number) => Math.ceil(max + 1),
                            ]}
                          />
                          <Tooltip
                            labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")}
                          />
                          <Line dataKey="value" stroke="#85a5c1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  ) : (
                    soilTempWeekly.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={soilTempWeekly}>
                          <XAxis dataKey="date" />
                          <YAxis unit="°C" />
                          <Tooltip />
                          <Legend />
                          <Line dataKey="max" name="最高温度" stroke="#c18585" strokeWidth={2} />
                          <Line dataKey="avg" name="平均温度" stroke="#92c185" strokeWidth={2} />
                          <Line dataKey="min" name="最低温度" stroke="#85a5c1" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* 土壌水分量7日間推移 */}
            {/* 表示方法（アナログ値or%）は要検討 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            <Card sx={{ width: '500px', borderRadius: 3, boxShadow: 3, p: 1 }}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center">
                      <WaterDropIcon sx={{ color: '#85a5c1' }} />
                      <Typography variant="subtitle1" color="text.primary">
                        土壌水分量の推移
                      </Typography>
                    </Stack>

                    <ToggleButtonGroup
                      size="small"
                      value={soilMoistureMode}
                      exclusive
                      onChange={(_, v) => v && setSoilMoistureMode(v)}
                    >
                      <ToggleButton value="standard">時系列</ToggleButton>
                      <ToggleButton value="processed">集計</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  {soilMoistureMode === 'standard' ? (
                    soilMoistureRaw.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={soilMoistureRaw} margin={{ right: 20, left: 10 }}>
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
                            tick={{ fontSize: 14 }}
                            domain={[
                              (min: number) => Math.floor(min - 5),
                              (max: number) => Math.ceil(max + 5),
                            ]}
                          />
                          <Tooltip
                            labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")}
                          />
                          <Line dataKey="value" stroke="#85a5c1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  ) : (
                    soilMoistureWeekly.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={soilMoistureWeekly}>
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line dataKey="max" name="最大値" stroke="#c18585" strokeWidth={2} />
                          <Line dataKey="avg" name="平均値" stroke="#92c185" strokeWidth={2} />
                          <Line dataKey="min" name="最小値" stroke="#85a5c1" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 室内温度7日間推移 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            {/* 室内温度 */}
            <Card sx={{ width: '500px', borderRadius: 3, boxShadow: 3, p: 1 }}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center">
                      <ThermostatIcon sx={{ color: '#c18585' }} />
                      <Typography variant="subtitle1" color="text.primary">
                        室内温度の推移
                      </Typography>
                    </Stack>

                    <ToggleButtonGroup
                      size="small"
                      value={roomTempMode}
                      exclusive
                      onChange={(_, v) => v && setRoomTempMode(v)}
                    >
                      <ToggleButton value="standard">時系列</ToggleButton>
                      <ToggleButton value="processed">集計</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  {roomTempMode === 'standard' ? (
                    roomTempRaw.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={roomTempRaw} margin={{ right: 20, left: 10 }}>
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
                            unit="°C"
                            tick={{ fontSize: 14 }}
                            domain={[
                              (min: number) => Math.floor(min - 1),
                              (max: number) => Math.ceil(max + 1),
                            ]}
                          />
                          <Tooltip
                            labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")}
                          />
                          <Line dataKey="value" stroke="#85a5c1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  ) : (
                    roomTempWeekly.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={roomTempWeekly}>
                          <XAxis dataKey="date" />
                          <YAxis unit="°C" />
                          <Tooltip />
                          <Legend />
                          <Line dataKey="max" name="最高温度" stroke="#c18585" strokeWidth={2} />
                          <Line dataKey="avg" name="平均温度" stroke="#92c185" strokeWidth={2} />
                          <Line dataKey="min" name="最低温度" stroke="#85a5c1" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* 室内湿度7日間推移 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            <Card sx={{ width: '500px', borderRadius: 3, boxShadow: 3, p: 1 }}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center">
                      <ThermostatIcon sx={{ color: '#85a5c1' }} />
                      <Typography variant="subtitle1" color="text.primary">
                        室内湿度の推移
                      </Typography>
                    </Stack>

                    <ToggleButtonGroup
                      size="small"
                      value={roomHumidMode}
                      exclusive
                      onChange={(_, v) => v && setRoomHumidMode(v)}
                    >
                      <ToggleButton value="standard">時系列</ToggleButton>
                      <ToggleButton value="processed">集計</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  {roomHumidMode === 'standard' ? (
                    roomHumidRaw.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={roomHumidRaw} margin={{ right: 20, left: 10 }}>
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
                            unit="%"
                            tick={{ fontSize: 14 }}
                            domain={[
                              (min: number) => Math.max(0, Math.floor(min - 5)),
                              (max: number) => Math.min(100, Math.ceil(max + 5)),
                            ]}
                          />
                          <Tooltip
                            labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")}
                          />
                          <Line dataKey="value" stroke="#85a5c1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  ) : (
                    roomHumidWeekly.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={roomHumidWeekly}>
                          <XAxis dataKey="date" />
                          <YAxis unit="%" />
                          <Tooltip />
                          <Legend />
                          <Line dataKey="max" name="最高湿度" stroke="#c18585" strokeWidth={2} />
                          <Line dataKey="avg" name="平均湿度" stroke="#92c185" strokeWidth={2} />
                          <Line dataKey="min" name="最低湿度" stroke="#85a5c1" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 日射量7日間推移 */}
            {/* 1日の最高、最低、平均日射量を7日間表示する */}
            <Card sx={{ width: '500px', borderRadius: 3, boxShadow: 3, p: 1 }}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center">
                      <SunnyIcon sx={{ color: '#c18585' }} />
                      <Typography variant="subtitle1" color="text.primary">
                        日射量の推移
                      </Typography>
                    </Stack>

                    <ToggleButtonGroup
                      size="small"
                      value={lightMode}
                      exclusive
                      onChange={(_, v) => v && setLightMode(v)}
                    >
                      <ToggleButton value="standard">時系列</ToggleButton>
                      <ToggleButton value="processed">集計</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  {lightMode === 'standard' ? (
                    lightRaw.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={lightRaw} margin={{ right: 20, left: 10 }}>
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
                            unit="lux"
                            tick={{ fontSize: 14 }}
                            domain={[
                              (min: number) => Math.max(0, Math.floor(min - 50)),
                              (max: number) => Math.ceil(max + 50),
                            ]}
                          />
                          <Tooltip
                            labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")}
                          />
                          <Line dataKey="value" stroke="#85a5c1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  ) : (
                    lightWeekly.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">データがありません</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={lightWeekly}>
                          <XAxis dataKey="date" />
                          <YAxis unit="lux" tick={{ fontSize: 14 }} />
                          <Tooltip />
                          <Legend />
                          <Line dataKey="max" name="最大値" stroke="#c18585" strokeWidth={2} />
                          <Line dataKey="avg" name="平均値" stroke="#92c185" strokeWidth={2} />
                          <Line dataKey="min" name="最小値" stroke="#85a5c1" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* CO2濃度7日間遷移 */}
            {/* 単純に数値を並べる 波打つようなグラフを想定 */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >   
                    <Stack direction="row"  alignItems="center">  
                      <SpeedIcon sx={{ color: '#85a5c1' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >CO₂濃度の推移</Typography>
                    </Stack> 
                    {co2Weekly.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          データがありません
                        </Typography>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={co2Weekly} margin={{ right: 20, left: 10 }}>
                            <XAxis
                              dataKey="ts"
                              type="number"
                              scale="time"
                              domain={[xTicks7[0], xTicks7[xTicks7.length - 1]]}
                              ticks={xTicks7}
                              tickFormatter={(ts: number) => dayjs(ts).format("MM/DD")}
                              interval={0}
                              tick={{ fontSize: 14 }}
                            />
                            <YAxis tick={{ fontSize: 14 }}unit="ppm" />
                            <Tooltip
                              // X 値（ts: number）を日時表示に
                              labelFormatter={(ts: number) => dayjs(ts).format("MM/DD HH:mm")}
                            />
                            <Line
                              dataKey="value"
                              name="CO₂"
                              stroke="#85a5c1"
                              strokeWidth={2}
                              dot={false}
                            />
                            {/* 日平均 */}
                            {/* <Line
                              data={co2DailyAvg}
                              dataKey="avg"
                              name="日平均"
                              stroke="#c18585"
                              strokeWidth={2}
                              dot={{ r: 2 }}
                              connectNulls
                              strokeDasharray="6 4" // 破線
                              isAnimationActive={false} // 初回アニメ重い場合はオフ
                            /> */}
                          </LineChart>
                        </ResponsiveContainer>
                      )}

                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* EC遷移 */}
            {/* ECのみ7日間ではなく全てのデータを表示する */}
            <Card sx={{width: '700px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >                     
                    <Stack direction="row"  alignItems="center"> 
                      <BoltIcon sx={{ color: '#c0c185' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >EC値の推移（週次）</Typography>                      
                    </Stack>
                    {ecWeekly.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        データがありません
                      </Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 250}}>
                        <ResponsiveContainer width="100%" height="100%" >
                          <LineChart data={ecWeekly} margin={{ top: 20, right: 30, bottom: 20, left: 30 }} >
                            <XAxis dataKey="date" />
                            <YAxis tick={{ fontSize: 14 }} unit="μS/cm" />
                            <Tooltip />
                            <Legend />
                            <Line dataKey="ec" name="EC" stroke="#c0c185" strokeWidth={2} dot={false} />
                            {/* <Line dataKey="tds" name="TDS" stroke="#85a5c1" strokeWidth={2} dot={false} /> */}
                            {/* <Line dataKey="temperature" name="温度" stroke="#c18585" strokeWidth={2} dot={false} /> */}
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

        </Container>
      </Box>
    </Box>
  );
}

