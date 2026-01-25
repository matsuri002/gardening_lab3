import { Typography, Box, Container, Button } from '@mui/material';
import Header from '../components/Header';

export default function SelectPlanterPageContainer() {
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

      {/* 鉢選択画面 */}
      <Box component='main' sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}
        >
        
        {/* 戻るボタン押下後TopPageに画面遷移 */}
        <Button size='large' sx={{ p: { xs: 2.5, sm: 3 } }}> 戻る </Button>

          <Box component='footer' sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant='h5'>コマツナを選択</Typography> {/* TODO:コマツナの部分はdataから持ってくる*/}
            <Typography variant='h5'>データの確認をしたい鉢を選択してください</Typography>
          </Box>
          
          {/* 鉢の表示 */} {/* TODO:表示する鉢はdataから持ってくる*/}
          <Box sx={{display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
            <Button
              variant='contained'
              color='success'
              size='large'
              sx={{ p: { xs: 2.5, sm: 3 } }}
            >
              コマツナA
            </Button>
            <Button
              variant='contained'
              color='success'
              size='large'
              sx={{ p: { xs: 2.5, sm: 3 } }}
            >
              コマツナB
            </Button>
            <Button
              variant='contained'
              color='success'
              size='large'
              sx={{ p: { xs: 2.5, sm: 3 } }}
            >
              コマツナC
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

