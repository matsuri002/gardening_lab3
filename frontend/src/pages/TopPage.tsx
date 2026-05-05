import { Typography, Box, Container, Button } from "@mui/material";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function TopPageContainer() {
  const [plantTypes, setPlantTypes] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlantTypes = async () => {
      const { data, error } = await supabase.from("plants").select("plant_type");

      if (error) {
        console.error(error);
        return;
      }

      const uniqueTypes = Array.from(new Set(data.map((item) => item.plant_type)));

      setPlantTypes(uniqueTypes);
    };

    fetchPlantTypes();
  }, []);

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
    </Box>
  );
}
