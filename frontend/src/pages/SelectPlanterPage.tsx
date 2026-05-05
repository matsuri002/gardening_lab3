import { Typography, Box, Container, Button } from "@mui/material";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useParams } from "react-router-dom";

type Plant = {
  id: string;
  year: number;
  plant_type: string;
  plant_name: string;
};

export default function SelectPlanterPageContainer() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const navigate = useNavigate();
  const { plantType } = useParams<{ plantType: string }>();

  useEffect(() => {
    const fetchPlants = async () => {
      const { data, error } = await supabase
        .from("plants")
        .select("*")
        .eq("plant_type", plantType)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("plants取得エラー", error);
        return;
      }

      setPlants(data ?? []);
    };

    fetchPlants();
  }, [plantType]);

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

      {/* 鉢選択画面 */}
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}
        >
          {/* 戻るボタン押下後TopPageに画面遷移 */}
          <BackButton to="/" />

          <Box component="footer" sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="h5">コマツナを選択</Typography>{" "}
            {/* TODO:コマツナの部分はdataから持ってくる*/}
            <Typography variant="h5">データの確認をしたい鉢を選択してください</Typography>
          </Box>

          {/* 鉢の表示 */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              width: "100%",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {plants.map((plant) => (
              <Button
                key={plant.id}
                variant="contained"
                size="large"
                sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "#85a5c1" }}
                onClick={() => {
                  navigate(`/plants/${plantType}/${plant.plant_name}/daily`);
                }}
              >
                {plant.plant_name}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
