import {
  AppBar, Toolbar, Typography, Box, Container, Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import GrassTwoToneIcon from '@mui/icons-material/GrassTwoTone';

export default function PhotoPageContainer() {
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

      {/* タブ - 写真を選択 */}
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
          <Typography variant='subtitle1' color='text.primary'>栽培開始（12月3日）から本日までの写真記録</Typography>  
          <Typography variant='body2' color='text.secondary'>※毎日6時、12時、18時、24時に撮影</Typography> 

          {/* TODO: 各グラフにスクロールバーを付ける */}
          <Box sx={{p: 2, display: 'flex', gap: 2, }}>
            {/* TODO: 再生・停止ボタンを設置 */}
            {/* TODO: 時間バーを設置 */}
            <Card sx={{width: '800px', height: '400px', borderRadius: 3, boxShadow: 3, p:1, bgcoler: 'background.paper', ':hover':{boxShadw:6}}}>
              <CardContent >
                <Stack direction='row' spacing={2} alignItems='center'> 
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <Typography variant='subtitle1' color='text.primary' >
                        2025年12月3日 6:00
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                    <Typography variant='subtitle1' color='text.primary' >
                        1 / 200
                    </Typography>
                  </Box>
                  <Stack spacing={0.5} >                     
                    <Typography variant='subtitle1' color='text.primary' >
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

