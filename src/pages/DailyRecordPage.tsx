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

export default function DailyRecordPageContainer() {
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

      {/* メイン */}
      <Box component='main' sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}
        >

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

          {/* 日付選択 */}          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="日付を選択" />
          </LocalizationProvider>

          {/* 土壌湿度 */}
          <Box sx={{p: 2, display: 'flex', gap: 2}}>
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">                
                  <Avatar variant="rounded" >
                    <ThermostatIcon />
                  </Avatar>

                  <Stack spacing={0.5}>  
                    <Typography variant="subtitle1" color="text.primary">
                      土壌温度
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      17.5 °C
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      30分毎更新
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* 土壌水分量 */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">                
                  <Avatar variant="rounded" >
                    <ThermostatIcon />
                  </Avatar>

                  <Stack spacing={0.5}>  
                    <Typography variant="subtitle1" color="text.primary">
                      土壌水分量
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      64.3 %
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      30分毎更新
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>  

            {/* 室内温湿度 */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">                
                  <Avatar variant="rounded" >
                    <ThermostatIcon />
                  </Avatar>

                  <Stack spacing={0.5}>  
                    <Typography variant="subtitle1" color="text.primary">
                      室内温湿度
                    </Typography>
                    <Box sx={{display: 'flex', gap: 2}}>
                      <Typography variant="h6" fontWeight={600}>
                        温度 : 22.5 °C
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        湿度 : 63 %
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      30分毎更新
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>   

            {/* 日射量 */}
            <Card sx={{borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">                
                  <Avatar variant="rounded" >
                    <ThermostatIcon />
                  </Avatar>

                  <Stack spacing={0.5}>  
                    <Typography variant="subtitle1" color="text.primary">
                      日射量
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      1000 lux
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      30分毎更新
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

