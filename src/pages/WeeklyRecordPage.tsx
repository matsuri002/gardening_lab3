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

export default function WeeklyRecordPageContainer() {
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
          {/* TODO: デフォルトで今日の日付から7日前までのデータを表示 */}      
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* 日付を選択し、選択した日付から7日前までのデータを表示する */}
            <DatePicker label='最終日を選択' />
          </LocalizationProvider>
          <Typography variant='subtitle1' color='text.primary'>過去7日間の推移</Typography>  
          <Typography variant='body2' color='text.secondary'>12月23日～12月30日</Typography> 

          {/* TODO: 各グラフにスクロールバーを付ける */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 土壌温度7日間推移 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'> 
                  <Stack spacing={0.5} >                     
                    <Typography variant='subtitle1' color='text.primary' >
                      <ThermostatIcon /> 
                      土壌温度の推移
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 土壌水分量7日間推移 */}
            {/* 表示方法（アナログ値or%）は要検討 */}
            {/* 単純に数値を並べる 波打つようなグラフを想定 */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'> 
                  <Stack spacing={0.5} >                     
                    <Typography variant='subtitle1' color='text.primary' >
                      <ThermostatIcon /> 
                      土壌水分量の推移
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            {/* 室内温湿度7日間推移 */}
            {/* 1日の最高、最低、平均温度を7日間表示する */}
            {/* TODO: デフォルトは両方とも表示し、室温だけ、湿度だけを表示できるようにする */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'> 
                  <Stack spacing={0.5} >                     
                    <Typography variant='subtitle1' color='text.primary' >
                      <ThermostatIcon /> 
                      室内温湿度の推移
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 日射量7日間推移 */}
            {/* 1日の最高、最低、平均日射量を7日間表示する */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'> 
                  <Stack spacing={0.5} >                     
                    <Typography variant='subtitle1' color='text.primary' >
                      <ThermostatIcon /> 
                      日射量の推移
                    </Typography>
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
                <Stack direction='row' spacing={2} alignItems='center'> 
                  <Stack spacing={0.5} >                     
                    <Typography variant='subtitle1' color='text.primary' >
                      <ThermostatIcon /> 
                      CO₂濃度の推移
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* EC遷移 */}
            {/* ECのみ7日間ではなく全てのデータを表示する */}
            <Card sx={{width: '500px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction='row' spacing={2} alignItems='center'> 
                  <Stack spacing={0.5} >                     
                    <Typography variant='subtitle1' color='text.primary' >
                      <ThermostatIcon /> 
                      EC値の推移（週次）
                    </Typography>
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

