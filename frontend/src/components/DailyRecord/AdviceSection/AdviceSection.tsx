import { Box, Card, CardContent, Stack, Avatar, Typography } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

type Props = {
  adviceText: string | null;
  daysFromStart: number;
};

export default function AdviceSection({ adviceText, daysFromStart }: Props) {
  if (!adviceText) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Card
        sx={{
          bgcolor: "primary.light",
          color: "primary.contrastText",
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <LightbulbIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 0.5 }}>
                栽培経過：{daysFromStart}日目
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {adviceText}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
