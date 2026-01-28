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
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Legend, Line, Tooltip } from 'recharts';
import RecordTabs from '../components/Tab';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { useParams } from 'react-router-dom';

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
    datetime: string; // MM/DD HH:mm
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

      const formatted = data
        .filter((row) => row.co2 != null)
        .map((row) => ({
          datetime: dayjs(row.measured_at.replace("+00", ""))
            .format("MM/DD HH:mm"),
          value: Number(row.co2),
        }));

      setCo2Weekly(formatted);
    } catch (err) {
      console.error("CO₂週次データ取得失敗:", err);
      setCo2Weekly([]);
    }
  };

  useEffect(() => {
    if (!endDate) return;

    fetchWeeklyStats(endDate, 'soil_temp').then(setSoilTempWeekly);
    fetchWeeklyStats(endDate, 'room_temp').then(setRoomTempWeekly);
    fetchWeeklyStats(endDate, 'room_humid').then(setRoomHumidWeekly);
    fetchWeeklyStats(endDate, 'soil_moisture').then(setSoilMoistureWeekly);
    fetchWeeklyStats(endDate, 'light').then(setLightWeekly);
    fetchEcWeeklyData();
    fetchWeeklyCo2Data(endDate);
  }, [endDate]);

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
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >  
                    <Stack direction="row"  alignItems="center">               
                      <ThermostatIcon sx={{ color: '#c1a185' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >土壌温度の推移</Typography>
                    </Stack>
                    {soilTempWeekly.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        データがありません
                      </Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={soilTempWeekly}>
                          <XAxis dataKey="date" />
                          <YAxis unit="°C" />
                          <Tooltip />
                          <Legend />
                          <Line dataKey="max" name="最高温度" stroke="#c18585"  strokeWidth={2} />
                          <Line dataKey="avg" name="平均温度" stroke="#92c185" strokeWidth={2} />
                          <Line dataKey="min" name="最低温度" stroke="#85a5c1" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 土壌水分量7日間推移 */}
            {/* 表示方法（アナログ値or%）は要検討 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >    
                    <Stack direction="row"  alignItems="center">                 
                      <WaterDropIcon sx={{ color: '#85a5c1' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >土壌水分量の推移</Typography>                    
                    </Stack>
                      {soilMoistureWeekly.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          データがありません
                        </Typography>
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
                      )}                  
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 室内温度7日間推移 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >
                    <Stack direction="row"  alignItems="center">                  
                      <ThermostatIcon sx={{ color: '#c18585' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >室内温度の推移</Typography>
                    </Stack>
                    {roomTempWeekly.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          データがありません
                        </Typography>
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
                      )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 室内湿度7日間推移 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >  
                    <Stack direction="row"  alignItems="center">     
                      <ThermostatIcon sx={{ color: '#85a5c1' }} /> 
                      <Typography variant="subtitle1" color="text.primary">室内湿度の推移</Typography>
                    </Stack> 
                    {roomHumidWeekly.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          データがありません
                        </Typography>
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
                      )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 日射量7日間推移 */}
            {/* 1日の最高、最低、平均日射量を7日間表示する */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >   
                    <Stack direction="row"  alignItems="center">                  
                      <SunnyIcon sx={{ color: '#c18585' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >日射量の推移</Typography>                    
                    </Stack>
                    {lightWeekly.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          データがありません
                        </Typography>
                      ) : (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={lightWeekly}>
                            <XAxis dataKey="date" />
                            <YAxis tick={{ fontSize: 14 }} unit="lux" />
                            <Tooltip />
                            <Legend />
                            <Line dataKey="max" name="最大値" stroke="#c18585" strokeWidth={2} />
                            <Line dataKey="avg" name="平均値" stroke="#92c185" strokeWidth={2} />
                            <Line dataKey="min" name="最小値" stroke="#85a5c1" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                  </Stack>
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
                          <LineChart data={co2Weekly}>
                            <XAxis
                              dataKey="datetime"
                              tick={{ fontSize: 12 }}
                              interval="preserveStartEnd"
                            />
                            <YAxis unit="ppm" />
                            <Tooltip />
                            <Line
                              dataKey="value"
                              name="CO₂"
                              stroke="#85a5c1"
                              strokeWidth={2}
                              dot
                            />
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

