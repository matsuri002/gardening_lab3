import { Typography, Box, Container, Button, CircularProgress, Backdrop } from "@mui/material";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { usePlantTypes } from "../../hooks/usePlantTypes/usePlantTypes";

export default function TopPageContainer() {
  const { plantTypes, loading } = usePlantTypes();
  const navigate = useNavigate();

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

      {/* メイン */}
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}
        >
          <Box component="footer" sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="h5">Gardening lab</Typography>
            <Typography variant="h5">野菜の種類を選択してください</Typography>
          </Box>
          {/* メニュー */}
          <Box sx={{ display: "flex", gap: 2, width: "100%", justifyContent: "center" }}>
            {plantTypes.map((type) => (
              <Button
                key={type}
                variant="contained"
                size="large"
                sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "#c18585" }}
                onClick={() => navigate(`/select-planter/${type}`)}
              >
                {type}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ローディング表示 */}
      <Backdrop open={loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
