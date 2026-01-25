import {
  AppBar, Toolbar, Typography, Box, Container, Button,
  Card,
  CardContent,
  Stack,
  } from '@mui/material';
import GrassTwoToneIcon from '@mui/icons-material/GrassTwoTone';
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

export default function WeeklyRecordPageContainer() {

  type WeeklyStatPoint = {
    date: string;
    max: number;    
    min: number;
    avg: number;
  };

  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs());
  const [soilTempWeekly, setSoilTempWeekly] = useState<WeeklyStatPoint[]>([]);
  const [roomTempWeekly, setRoomTempWeekly] = useState<WeeklyStatPoint[]>([]);
  const [roomHumidWeekly, setRoomHumidWeekly] = useState<WeeklyStatPoint[]>([]);
  const [soilMoistureWeekly, setSoilMoistureWeekly] = useState<WeeklyStatPoint[]>([]);
  const [lightWeekly, setLightWeekly] = useState<WeeklyStatPoint[]>([]);

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

  useEffect(() => {
    if (!endDate) return;

    fetchWeeklyStats(endDate, 'soil_temp').then(setSoilTempWeekly);
    fetchWeeklyStats(endDate, 'room_temp').then(setRoomTempWeekly);
    fetchWeeklyStats(endDate, 'room_humid').then(setRoomHumidWeekly);
    fetchWeeklyStats(endDate, 'soil_moisture').then(setSoilMoistureWeekly);
    fetchWeeklyStats(endDate, 'light').then(setLightWeekly);
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
      <AppBar position='static' color='success' enableColorOnDark>
        <Toolbar sx={{ py: 1.25 }}>
          <GrassTwoToneIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant='h5'>Gardening Lab</Typography>
        </Toolbar>
      </AppBar>

      {/* TODO: 戻るボタンとタブは上部固定にする */}
      {/* 戻るボタン押下後SelectPlanterPageに画面遷移 */}
      <Button size='large' sx={{ p: { xs: 2.5, sm: 3 } }}> 戻る </Button>

      {/* タブ - 1週間の記録を選択 */}
      <Box sx={{ maxWidth: { xs: 320, sm: 480 }, bgcolor: 'background.paper' }}>
        <RecordTabs />
      </Box>

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
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
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
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* EC遷移 */}
            {/* ECのみ7日間ではなく全てのデータを表示する */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack spacing={1} sx={{ width: '100%' }}> 
                  <Stack spacing={0.5} >                     
                    <Stack direction="row"  alignItems="center"> 
                      <BoltIcon sx={{ color: '#c0c185' }} /> 
                      <Typography variant='subtitle1' color='text.primary' >EC値の推移（週次）</Typography>
                    </Stack>
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

