import { Typography, Box, Container, Card, CardContent, Stack } from "@mui/material";
import RecordTabs from "../../components/Tab";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import { useParams } from "react-router-dom";
import { usePhotoRecord } from "../../hooks/usePhotoRecord/usePhotoRecord";
import PhotoViewer from "../../components/PhotoRecord/PhotoViewer/PhotoViewer";
import PhotoControls from "../../components/PhotoRecord/PhotoControls/PhotoControls";

export default function PhotoPageContainer() {
  const { plantType } = useParams<{
    plantType: string;
  }>();

  const { plantName } = useParams<{ plantName: string }>();

  const {
    latestPhoto,
    loading,
    photos,
    currentIndex,
    isPlaying,
    handlePrev,
    handleNext,
    handlePlay,
    stopPlay,
  } = usePhotoRecord(plantName);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* ヘッダー */}
      <Header />

      {/* タブ - 写真を選択 */}
      <Stack direction="row" spacing={15} alignItems="center">
        <RecordTabs />
        {plantType && <BackButton to={`/select-planter/${plantType}`} />}
      </Stack>

      {/* メイン */}
      <Box
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}
        >
          <Typography variant="subtitle1" color="text.primary">
            栽培開始（12月8日）から本日までの写真記録
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ※毎日6時、12時、18時、24時に撮影
          </Typography>

          <Box sx={{ p: 2, display: "flex", gap: 2 }}>
            <Card sx={{ width: "800px" }}>
              <CardContent>
                <PhotoViewer latestPhoto={latestPhoto} loading={loading} />
              </CardContent>
              <PhotoControls
                currentIndex={currentIndex}
                totalPhotos={photos.length}
                isPlaying={isPlaying}
                loading={loading}
                onPrev={handlePrev}
                onNext={handleNext}
                onPlay={handlePlay}
                onStop={stopPlay}
              />
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
