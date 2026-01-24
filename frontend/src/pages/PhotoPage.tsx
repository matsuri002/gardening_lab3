import {
  AppBar, Toolbar, Typography, Box, Container, Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import GrassTwoToneIcon from '@mui/icons-material/GrassTwoTone';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';

type PhotoRecord = {
  id: string;
  taken_at: string;
  storage_path: string;
  photo_url: string;
};

export default function PhotoPageContainer() {

  const [latestPhoto, setLatestPhoto] = useState<PhotoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const plantId = 'd5961b2c-fd83-4ccf-a3da-709e9aca6945';

  const handlePrev = () => {
      setCurrentIndex((prev) => {
        const nextIndex = Math.min(prev + 1, photos.length - 1);
        setLatestPhoto(photos[nextIndex]);
        return nextIndex;
      });
    };

    const handleNext = () => {
      setCurrentIndex((prev) => {
        const nextIndex = Math.max(prev - 1, 0);
        setLatestPhoto(photos[nextIndex]);
        return nextIndex;
      });
    };

  useEffect(() => {
    const fetchLatestPhoto = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('photos')
        .select('id, taken_at, storage_path')
        .eq('plant_id', plantId)
        .order('taken_at', { ascending: false })

      if (error || !data) {
        console.error('最新写真取得失敗', error);
        setLatestPhoto(null);
        setLoading(false);
        return;
      }

      const photoList: PhotoRecord[] = data.map((photo) => {
      const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(photo.storage_path);

        return {
          ...photo,
          photo_url: urlData.publicUrl,
        };
      });

      setPhotos(photoList);
      setCurrentIndex(0);           // 最新1枚
      setLatestPhoto(photoList[0]); // 既存ロジック維持
      setLoading(false);
    };   

    fetchLatestPhoto();
  }, []);

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
            <Card sx={{ width: '800px'}}>
              <CardContent>
                {loading ? (
                  <Typography>読み込み中...</Typography>
                ) : !latestPhoto ? (
                  <Typography color="text.secondary">
                    写真がありません
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">
                      {dayjs(latestPhoto.taken_at.replace('+00', '')).format(
                        'YYYY年MM月DD日 HH:mm'
                      )}
                    </Typography>

                    <Box
                      component="img"
                      src={latestPhoto.photo_url}
                      alt="plant photo"
                      sx={{
                        width: '100%',
                        maxHeight: 450,
                        objectFit: 'contain',
                        borderRadius: 2,
                        margin: '0 auto',
                      }}
                    />
                  </Stack>
                )}
              </CardContent>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{pb: '3px'}}>
                <Button
                  onClick={handlePrev}
                  disabled={currentIndex >= photos.length - 1}
                >
                  ◀
                </Button>
                <Typography>
                  {photos.length - currentIndex} / {photos.length}
                </Typography>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex <= 0}
                >
                  ▶
                </Button>
              </Stack>
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

