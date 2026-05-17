import { Stack, Typography, Button } from "@mui/material";

type PhotoControlsProps = {
  currentIndex: number;
  totalPhotos: number;
  isPlaying: boolean;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onStop: () => void;
};

export default function PhotoControls({
  currentIndex,
  totalPhotos,
  isPlaying,
  loading,
  onPrev,
  onNext,
  onPlay,
  onStop,
}: PhotoControlsProps) {
  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ pb: "3px" }}>
        <Button onClick={onPrev} disabled={currentIndex <= 0} sx={{ color: "#85a5c1" }}>
          ◀
        </Button>
        <Typography>
          {totalPhotos > 0 ? currentIndex + 1 : 0} / {totalPhotos}
        </Typography>
        <Button
          onClick={onNext}
          disabled={currentIndex >= totalPhotos - 1 || totalPhotos === 0}
          sx={{ color: "#85a5c1" }}
        >
          ▶
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ pb: "3px" }}>
        <Button
          variant="contained"
          onClick={onPlay}
          disabled={isPlaying || loading || totalPhotos === 0}
          sx={{ bgcolor: "#85a5c1" }}
        >
          ▶ 再生
        </Button>

        <Button variant="outlined" onClick={onStop} disabled={!isPlaying} sx={{ color: "#85a5c1" }}>
          ⏸ 停止
        </Button>
      </Stack>
    </>
  );
}
