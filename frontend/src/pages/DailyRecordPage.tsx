import {
  Typography, Box, Container,
  Card,
  CardContent,
  Stack,
  Avatar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ThermostatIcon from '@mui/icons-material/Thermostat'
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { supabase } from '../lib/supabase';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import SunnyIcon from '@mui/icons-material/Sunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import RecordTabs from "../components/Tab";
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { useParams } from 'react-router-dom';
import ChartCardFrame from '../components/ChartCardFrame';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function DailyRecordPageContainer() {
  
  type EnvironmentData = {
    soilTemp: number | null;
    soilMoisture: number | null;
    roomTemp: number | null;
    roomHumid: number | null;
    light: number | null;
  };

  const [envData, setEnvData] = useState<EnvironmentData>({
    soilTemp: null,
    soilMoisture: null,
    roomTemp: null,
    roomHumid: null,
    light: null,
  });

  type DailyDataPoint = {
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

  const { plantType } = useParams<{
    plantType: string;
  }>();

 type EcRow = {
    ec: number;
    tds: number;
    temperature: number;
    measured_at: string;
  };

  type EcData = {
    ec: number;
    tds: number;
    temperature: number;
    measuredAt: string;
  };

  type Co2Row = {
    measured_at: string;
    co2: number | null;
  };

  type Co2DataPoint = {
    time: string;
    value: number;
  };

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
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
  

  const fetchEnvironmentData = async (
    selectedDate: dayjs.Dayjs
  ) => {
    try {
      // JSTとしてそのまま扱う
      const base = selectedDate.format('YYYY-MM-DD');
      const isToday = selectedDate.isSame(dayjs(), 'day');

      let query = supabase 
        .from('environment_measurements')
        .select(`
          measured_at,
          soil_temp,
          soil_moisture,
          room_temp,
          room_humid,
          light
        `)
        .eq('plant_id', 'd5961b2c-fd83-4ccf-a3da-709e9aca6945')

      if (isToday) {
        query = query
          .gte('measured_at', `${base} 00:00:00`)
          .lte('measured_at', `${base} 23:59:59`)
          .order('measured_at', { ascending: false })
          .limit(1);
      } else {
        // 過去日　閲覧時刻のデータを表示
        // 30分単位で現在時刻を作る
        const now = dayjs();
        const roundedMinute = now.minute() < 30 ? '00' : '30';
        const hour = now.hour().toString().padStart(2, '0');
        const targetTime = `${hour}:${roundedMinute}`;

        query = query
          .gte('measured_at', `${base} ${targetTime}:00`)
          .lte('measured_at', `${base} ${targetTime}:59`)
          .order('measured_at', { ascending: false })
          .limit(1);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        // 今日だがデータがまだない
        setEnvData({
          soilTemp: null,
          soilMoisture: null,
          roomTemp: null,
          roomHumid: null,
          light: null,
        });
        setMeasuredAt(null);
        setNoDataMessage(
          isToday ? '本日のデータはありません' : '該当時刻のデータはありません'
        );
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
      console.error('環境データ取得失敗:', err);
    }
  };

  const fetchDailySensorData = async (
    selectedDate: dayjs.Dayjs,
    column: 'soil_temp' | 'soil_moisture' | 'room_temp' | 'room_humid' | 'light',
    setter: React.Dispatch<React.SetStateAction<DailyDataPoint[]>>
  ) => {
    try {
      const base = selectedDate.format('YYYY-MM-DD');

      const { data, error } = await supabase
        .from('environment_measurements')
        .select(`measured_at, ${column}`)
        .eq('plant_id', 'd5961b2c-fd83-4ccf-a3da-709e9aca6945')
        .gte('measured_at', `${base} 00:00:00`)
        .lte('measured_at', `${base} 23:59:59`)
        .order('measured_at', { ascending: true }) as {
          data: EnvironmentRow[] | null;
          error: any;
        };

      if (error) throw error;

      if (!data || data.length === 0) {
        setter([]);
        return;
      }

      const formatted = data
        .filter((row) => row[column] !== null)
        .map((row) => ({
          time: dayjs(row.measured_at.replace('+00', '')).format('HH:mm'),
          value: row[column] as number,
        }));

      setter(formatted);
    } catch (err) {
      console.error(`日内推移取得失敗 (${column}):`, err);
      setter([]);
    }
  };

  // EC
  const avg = (values: number[]) =>
    values.reduce((a, b) => a + b, 0) / values.length;

  const fetchEcRowsByDate = async (date: string) => {
    const start = `${date} 00:00:00`;
    const end = `${date} 23:59:59`;

    const { data } = await supabase
      .from("ec_measurements")
      .select("ec, tds, temperature, measured_at")
      .eq("plant_id", "d5961b2c-fd83-4ccf-a3da-709e9aca6945")
      .gte("measured_at", start)
      .lte("measured_at", end);

    return (data ?? []) as EcRow[];
  };

  const fetchEcDataBySelectedDate = async (selectedDate: string) => {
    // 選択日のデータを試す
    let rows = await fetchEcRowsByDate(selectedDate);

    // なければ「過去で一番新しい日」を探す
    if (rows.length === 0) {
      const { data } = await supabase
        .from("ec_measurements")
        .select("measured_at")
        .eq("plant_id", "d5961b2c-fd83-4ccf-a3da-709e9aca6945")
        .lt("measured_at", `${selectedDate} 00:00:00`)
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

      selectedDate = latestDate;
    }

    // 平均して state にセット
    setEcData({
      ec: Math.round(avg(rows.map(r => r.ec))),
      tds: Math.round(avg(rows.map(r => r.tds))),
      temperature: Number(avg(rows.map(r => r.temperature)).toFixed(1)),
      measuredAt: selectedDate,
    });
  };

  const fetchLatestCo2Data = async (selectedDate: dayjs.Dayjs) => {
    const base = selectedDate.format("YYYY-MM-DD");
    const isToday = selectedDate.isSame(dayjs(), "day");

    let query = supabase
      .from("co2_measurements")
      .select("measured_at, co2")
      .eq("plant_id", "d5961b2c-fd83-4ccf-a3da-709e9aca6945");

    if (isToday) {
      // 今日 → 最新1件
      query = query
        .gte("measured_at", `${base} 00:00:00`)
        .lte("measured_at", `${base} 23:59:59`)
        .order("measured_at", { ascending: false })
        .limit(1);
    } else {
      // 過去日 → 閲覧時刻を6時間単位で丸める
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

    const row = data[0];

    setLatestCo2({
      time: dayjs.utc(row.measured_at).format("HH:mm"),
      value: row.co2,
    });
  };

  const fetchDailyCo2Data = async (selectedDate: dayjs.Dayjs) => {
    try {
      const base = selectedDate.format("YYYY-MM-DD");

      const { data, error } = await supabase
        .from("co2_measurements")
        .select("measured_at, co2")
        .eq("plant_id", "d5961b2c-fd83-4ccf-a3da-709e9aca6945")
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
  };

    useEffect(() => {
      if (!selectedDate) return;
      fetchEnvironmentData(selectedDate);
      fetchDailySensorData(selectedDate, 'soil_temp', setSoilTempDaily);
      fetchDailySensorData(selectedDate, 'soil_moisture', setSoilMoistureDaily);
      fetchDailySensorData(selectedDate, 'room_temp', setRoomTempDaily);
      fetchDailySensorData(selectedDate, 'room_humid', setRoomHumidDaily);
      fetchDailySensorData(selectedDate, 'light', setLightDaily);
      fetchEcDataBySelectedDate(
        dayjs(selectedDate).format("YYYY-MM-DD")
      );
      fetchLatestCo2Data(selectedDate);
      fetchDailyCo2Data(selectedDate);
    }, [selectedDate]);

  // 同じ時刻の温度と湿度を1レコードにまとめる
  const roomTHDaily = roomTempDaily.map((tempRow) => {
  const humidRow = roomHumidDaily.find(
    (h) => h.time === tempRow.time
  );

  return {
    time: tempRow.time,
    temp: tempRow.value,
    humid: humidRow ? humidRow.value : null,
  };
});

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

      {/* TODO: 戻るボタンとタブは上部固定にする */}
      

      {/* タブ */}
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
          {/* TODO: デフォルトで今日の日付　栽培完了時は最終日の日付に設定 */}      
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
              label='日付を選択'
              value={selectedDate}
              onChange={(newValue) => {
                if (!newValue) return;
                setSelectedDate(newValue);
              }} />
          </LocalizationProvider>

          {/* TODO: 閲覧時の時刻を30分単位で表示　12:13分の場合は12:00時点と表示 */}
          <Typography variant='body2' color='text.secondary'>
            {noDataMessage ? (
              <Typography color="text.secondary">
                {noDataMessage}
              </Typography>
            ) : (
              measuredAt && (
                <Typography variant="body2" color="text.secondary">
                  {dayjs(measuredAt.replace('+00', '')).format('YYYY/MM/DD HH:mm')} 時点
                </Typography>
              )
            )}
            </Typography>            
          {/* 土壌温度、土壌水分量、室内温湿度、日射量表示 */}
          {/* TODO: 当日の場合は最新のデータを表示、前日以前の場合は閲覧時の時刻のデータを表示 */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 土壌湿度 */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'>                
                  <Avatar sx={{ bgcolor: '#c1a185' }} variant='rounded' >
                    <ThermostatIcon />
                  </Avatar>
                  <Stack spacing={0.5}>  
                    <Typography variant='subtitle1' color='text.primary'>
                      土壌温度
                    </Typography>
                    <Typography variant='h6' fontWeight={600}>
                      {envData.soilTemp !== null ? `${envData.soilTemp} ` : '--'}°C
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      30分毎更新
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 土壌水分量 */}
            {/* 水やりの時間（6,18時）には印をつける */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'>                
                  <Avatar sx={{ bgcolor: '#85a5c1' }} variant='rounded' >
                    <WaterDropIcon />
                  </Avatar>
                  <Stack spacing={0.5}>  
                    <Typography variant='subtitle1' color='text.primary'>
                      土壌水分量
                    </Typography>
                    <Typography variant='h6' fontWeight={600}>
                       {envData.soilMoisture !== null ? `${envData.soilMoisture} ` : '--'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      30分毎更新
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>  

            {/* 室内温湿度 */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'>                
                  <Avatar sx={{ bgcolor: '#A395A3' }} variant='rounded' >
                    <ThermostatIcon />
                  </Avatar>
                  <Stack spacing={0.5}>  
                    <Typography variant='subtitle1' color='text.primary'>
                      室内温湿度
                    </Typography>
                    <Box sx={{display: 'flex', gap: 2}}>
                      <Typography variant='h6' fontWeight={600}>
                        温度 : {envData.roomTemp ?? '--'} °C
                      </Typography>
                      <Typography variant='h6' fontWeight={600}>
                        湿度 : {envData.roomHumid ?? '--'} %
                      </Typography>
                    </Box>
                    <Typography variant='body2' color='text.secondary'>
                      30分毎更新
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>   

            {/* 日射量 */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'>                
                  <Avatar sx={{ bgcolor: '#c18585' }} variant='rounded' >
                    <SunnyIcon />
                  </Avatar>
                  <Stack spacing={0.5}>  
                    <Typography variant='subtitle1' color='text.primary'>
                      日射量
                    </Typography>
                    <Typography variant='h6' fontWeight={600}>
                      {envData.light !== null ? `${envData.light} ` : '--'}lux
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      30分毎更新
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>    
          </Box>

          {/* CO2濃度、EC値表示 */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* CO₂濃度 */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'>                
                  <Avatar sx={{ bgcolor: '#85a5c1' }} variant='rounded' >
                    <SpeedIcon />
                  </Avatar>
                  <Stack spacing={0.5}>  
                    <Typography variant='subtitle1' color='text.primary'>
                      CO₂濃度
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {latestCo2 ? `${latestCo2.value} ppm` : "--"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {latestCo2
                        ? `6時間毎測定 - ${latestCo2.time} 時点`
                        : "データなし"}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* EC値 */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'>                
                  <Avatar sx={{ bgcolor: '#c0c185' }} variant='rounded' >
                    <BoltIcon />
                  </Avatar>

                  <Stack spacing={0.5}>  
                    <Typography variant='subtitle1' color='text.primary'>
                      EC値（電気伝導率）
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {ecData ? `${ecData.ec} μS/cm` : "--"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ecData
                        ? `週1回測定 - 測定 : ${dayjs(ecData.measuredAt).format("YYYY/MM/DD")}`
                        : "データなし"}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* 土壌温度、土壌水分量の日内推移 */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 土壌温度推移 */}
            <ChartCardFrame
              title="土壌温度の推移"
              icon={<ThermostatIcon sx={{ color: "#c1a185" }} />}
              width={500}
            >
              {soilTempDaily.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  データがありません
                </Typography>
              ) : (
                <Box sx={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={soilTempDaily}>
                      <XAxis dataKey="time" />
                      <YAxis unit="°C" />
                      <Tooltip />
                      <Line
                        dataKey="value"
                        name="土壌温度"
                        strokeWidth={2}
                        dot={false}
                        stroke="#c1a185"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </ChartCardFrame>

            {/* 土壌水分量推移 */}
            <ChartCardFrame
              title="土壌水分量の推移"
              icon={<WaterDropIcon sx={{ color: "#85a5c1" }} />}
              width={500}
            >
              {soilMoistureDaily.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  データがありません
                </Typography>
              ) : (
                <Box sx={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={soilMoistureDaily}>
                      <XAxis dataKey="time" />
                      <YAxis unit="" />
                      <Tooltip />
                      <Line
                        dataKey="value"
                        name="土壌水分量"
                        dot={false}
                        strokeWidth={2}
                        stroke="#85a5c1"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </ChartCardFrame>
          </Box>

          {/* 室内温湿度、日射量の日内推移 */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 室内温湿度推移 */}
            <ChartCardFrame
              title="室内温湿度の推移"
              icon={<ThermostatIcon sx={{ color: "#A395A3" }} />}
              width={500}
            >
              {roomTHDaily.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  データがありません
                </Typography>
              ) : (
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={roomTHDaily}>
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" unit="°C" />
                      <YAxis yAxisId="right" orientation="right" unit="%" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        dataKey="temp"
                        dot={false}
                        strokeWidth={2}
                        name="室内温度"
                        stroke="#c18585"
                      />
                      <Line
                        yAxisId="right"
                        dataKey="humid"
                        dot={false}
                        strokeWidth={2}
                        name="室内湿度"
                        stroke="#85a5c1"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </ChartCardFrame>

            {/* 日射量推移 */}
            <ChartCardFrame
              title="日射量の推移"
              icon={<SunnyIcon sx={{ color: "#c18585" }} />}
              width={500}
            >
              {lightDaily.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  データがありません
                </Typography>
              ) : (
                <Box sx={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lightDaily}>
                      <XAxis dataKey="time" />
                      <YAxis tick={{ fontSize: 14 }} unit="lux" />
                      <Tooltip />
                      <Line
                        dataKey="value"
                        name="日射量"
                        dot={false}
                        strokeWidth={2}
                        stroke="#c18585"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </ChartCardFrame>
          </Box>

          {/* Co2濃度遷移 */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            <ChartCardFrame
              title="CO₂濃度の推移"
              icon={<SpeedIcon sx={{ color: "#85a5c1" }} />}
              width={1000}
            >
              {co2Daily.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  データがありません
                </Typography>
              ) : (
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={co2Daily} margin={{ right: 30, left: 30 }}>
                      <XAxis dataKey="time" />
                      <YAxis unit="ppm" />
                      <Tooltip />
                      <Line
                        dataKey="value"
                        name="CO₂"
                        dot
                        strokeWidth={2}
                        stroke="#85a5c1"
                      />
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

