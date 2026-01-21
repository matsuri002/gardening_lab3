import {
  AppBar, Toolbar, Typography, Box, Container, Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Avatar,
} from '@mui/material';
import GrassTwoToneIcon from '@mui/icons-material/GrassTwoTone';
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

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [measuredAt, setMeasuredAt] = useState<string | null>(null);
  const [noDataMessage, setNoDataMessage] = useState<string | null>(null);
  const [soilTempDaily, setSoilTempDaily] = useState<DailyDataPoint[]>([]);
  const [soilMoistureDaily, setSoilMoistureDaily] = useState<DailyDataPoint[]>([]);
  const [roomTempDaily, setRoomTempDaily] = useState<DailyDataPoint[]>([]);
  const [roomHumidDaily, setRoomHumidDaily] = useState<DailyDataPoint[]>([]);
  const [lightDaily, setLightDaily] = useState<DailyDataPoint[]>([]);

  

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

  useEffect(() => {
    if (!selectedDate) return;
    fetchEnvironmentData(selectedDate);
    fetchDailySensorData(selectedDate, 'soil_temp', setSoilTempDaily);
    fetchDailySensorData(selectedDate, 'soil_moisture', setSoilMoistureDaily);
    fetchDailySensorData(selectedDate, 'room_temp', setRoomTempDaily);
    fetchDailySensorData(selectedDate, 'room_humid', setRoomHumidDaily);
    fetchDailySensorData(selectedDate, 'light', setLightDaily);
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
      <AppBar position='static' color='success' enableColorOnDark>
        <Toolbar sx={{ py: 1.25 }}>
          <GrassTwoToneIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant='h5'>Gardening Lab</Typography>
        </Toolbar>
      </AppBar>

      {/* TODO: 戻るボタンとタブは上部固定にする */}
      {/* 戻るボタン押下後SelectPlanterPageに画面遷移 */}
      <Button size='large' sx={{ p: { xs: 2.5, sm: 3 } }}> 戻る </Button>

      {/* タブ */}
      <Box sx={{ maxWidth: { xs: 320, sm: 480 }, bgcolor: 'background.paper' }}>
        <Tabs>
            <Tab label='本日の記録'></Tab>
            <Tab label='1週間の記録'></Tab>
            <Tab label='写真'></Tab>
        </Tabs>
      </Box>

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
                    <Typography variant='h6' fontWeight={600}>
                      440 ppm
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      6時間毎測定 - 2026/01/17 0時時点
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
                    <Typography variant='h6' fontWeight={600}>
                      1.2 μs/cm
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      週1回測定 - 最終測定 : 2025/12/29  {/* 最終測定日を表示 */}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* 土壌温度、土壌水分量の日内推移 */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 土壌温度推移 */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >                     
                    <Stack direction="row"  alignItems="center">               
                      <ThermostatIcon sx={{ color: '#c1a185' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >土壌温度の推移</Typography>
                    </Stack>
                    {soilTempDaily.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          データがありません
                        </Typography>
                      ) : (
                        <Box sx={{ width: '100%', height: 250 }}>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={soilTempDaily}>
                              <XAxis dataKey="time" />
                              <YAxis unit="°C" />
                              <Tooltip />
                              <Line dataKey="value" name="土壌温度" strokeWidth={2} dot={false} stroke="#c1a185" />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 土壌水分量推移 */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack spacing={0.5} >                     
                    <Stack direction="row"  alignItems="center">                 
                      <WaterDropIcon sx={{ color: '#85a5c1' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >土壌水分量の推移</Typography>                    
                    </Stack>
                    {soilMoistureDaily.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        データがありません
                      </Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={soilMoistureDaily}>
                            <XAxis dataKey="time" />
                            <YAxis unit="" />
                            <Tooltip />
                            <Line dataKey="value" name="土壌水分量" dot={false} strokeWidth={2} stroke="#85a5c1" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* 室内温湿度、日射量の日内推移 */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 室内温湿度推移 */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack spacing={0.5} >                     
                    <Stack direction="row"  alignItems="center">                  
                      <ThermostatIcon sx={{ color: '#A395A3' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >室内温湿度の推移</Typography>
                    </Stack>
                    {/* 室内温湿度 */}
                    {roomTHDaily.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        データがありません
                      </Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 300 }}>
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
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 日射量推移 */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack spacing={0.5} >                     
                    <Stack direction="row"  alignItems="center">                  
                      <SunnyIcon sx={{ color: '#c18585' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >日射量の推移</Typography>                    
                    </Stack>
                    {lightDaily.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        データがありません
                      </Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={lightDaily}>
                            <XAxis dataKey="time" />
                            <YAxis tick={{ fontSize: 14 }} unit="lux" />
                            <Tooltip />
                            <Line dataKey="value" name="日射量" dot={false} strokeWidth={2} stroke="#c18585" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Co2濃度遷移 */}
            <Card sx={{width: '1000px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'> 
                  <Stack spacing={0.5} >                     
                    <Stack direction="row"  alignItems="center">  
                      <SpeedIcon sx={{ color: '#85a5c1' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >CO₂濃度の推移</Typography>
                    </Stack> 
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

        </Container>
      </Box>
    </Box>
  );
}

