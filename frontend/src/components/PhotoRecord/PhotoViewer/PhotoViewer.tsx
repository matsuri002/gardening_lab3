import { Typography, Box, Stack } from "@mui/material";
import dayjs from "dayjs";
import type { PhotoRecord } from "../../../hooks/usePhotoRecord/usePhotoRecord";

type PhotoViewerProps = {
  latestPhoto: PhotoRecord | null;
  loading: boolean;
};

export default function PhotoViewer({ latestPhoto, loading }: PhotoViewerProps) {
  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  if (!latestPhoto) {
    return <Typography color="text.secondary">写真がありません</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">
        {dayjs(latestPhoto.taken_at.replace("+00", "")).format("YYYY年MM月DD日 HH:mm")}
      </Typography>

      <Box
        component="img"
        src={latestPhoto.photo_url}
        alt="plant photo"
        sx={{
          width: "100%",
          maxHeight: 450,
          objectFit: "contain",
          borderRadius: 2,
          margin: "0 auto",
        }}
      />
    </Stack>
  );
}
