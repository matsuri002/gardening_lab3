import {
  Typography, Box, Container, Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';
import RecordTabs from '../components/Tab';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import { useParams } from 'react-router-dom';

type PhotoRecord = {
  id: string;
  taken_at: string;
  storage_path: string;
  photo_url: string;
};

export default function PhotoPageContainer() {

  const { plantType } = useParams<{
    plantType: string;
  }>();

  const [latestPhoto, setLatestPhoto] = useState<PhotoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const plantId = 'd5961b2c-fd83-4ccf-a3da-709e9aca6945';

  const handlePrev = () => {
      setCurrentIndex((prev) => {
        const nextIndex = Math.max(prev - 1, 0);
        setLatestPhoto(photos[nextIndex]);
        return nextIndex;
      });
    };

    const handleNext = () => {
      setCurrentIndex((prev) => {
        const nextIndex = Math.min(prev + 1, photos.length - 1);
        setLatestPhoto(photos[nextIndex]);
        return nextIndex;
      });
    };

    const handlePlay = () => {
      if (photos.length === 0) return;

      setCurrentIndex(0);
      setLatestPhoto(photos[0]);
      setIsPlaying(true);
    };

  useEffect(() => {
    const fetchLatestPhoto = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('photos')
        .select('id, taken_at, storage_path')
        .eq('plant_id', plantId)
        .order('taken_at', { ascending: true })

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
      setCurrentIndex(photoList.length - 1);           // 最新1枚
      setLatestPhoto(photoList[photoList.length - 1]); // 既存ロジック維持
      setLoading(false);
    };   

    fetchLatestPhoto();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;

        if (next >= photos.length) {
          // 最後まで行ったら停止
          setIsPlaying(false);
          return prev;
        }

        setLatestPhoto(photos[next]);
        return next;
      });
    }, 300); // ← 再生速度

    return () => clearInterval(interval);
  }, [isPlaying, photos]);

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

      {/* タブ - 写真を選択 */}
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
          <Typography variant='subtitle1' color='text.primary'>栽培開始（12月8日）から本日までの写真記録</Typography>  
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
                  disabled={currentIndex <= 0}
                  sx={{ color:"#85a5c1"}}
                >
                  ◀
                </Button>
                <Typography>
                  {currentIndex + 1} / {photos.length}
                </Typography>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex >= photos.length - 1}
                  sx={{ color:"#85a5c1"}}
                >
                  ▶
                </Button>
              </Stack>
              <Stack direction="row" spacing={2}  justifyContent="center" sx={{pb: '3px'}} >
                <Button
                  variant="contained"
                  onClick={handlePlay}
                  disabled={isPlaying || loading}
                  sx={{ bgcolor:"#85a5c1"}}
                >
                  ▶ 再生
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setIsPlaying(false)}
                  disabled={!isPlaying}
                  sx={{ color:"#85a5c1"}}
                >
                  ⏸ 停止
                </Button>
            </Stack>
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

