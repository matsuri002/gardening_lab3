import {
  AppBar, Toolbar, Typography, Box, Container, Button,
} from '@mui/material';
import GrassTwoToneIcon from '@mui/icons-material/GrassTwoTone';

export default function TopPageContainer() {
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
          <Box component='footer' sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant='h5'>Gardening lab</Typography>
            <Typography variant='h5'>野菜の種類を選択してください</Typography>
          </Box>
          {/* メニュー */}
          <Box sx={{display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
            <Button
              variant='contained'
              color='success'
              size='large'
              sx={{ p: { xs: 2.5, sm: 3 } }}
            >
              コマツナ
            </Button>
            <Button
              variant='contained'
              color='secondary'
              size='large'
              sx={{ p: { xs: 2.5, sm: 3 } }}
            >
              トマト
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

