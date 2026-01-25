import { Tabs, Tab, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const RecordTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = () => {
    if (location.pathname === "/weekly") return 1;
    if (location.pathname === "/photo") return 2;
    return 0;
  };

  return (
    <Box sx={{ maxWidth: { xs: 320, sm: 480 }, bgcolor: 'background.paper',  }}>
      <Tabs
         sx={{
          "& .MuiTab-root": {
            color: "#A395A3",          // 通常文字色
          },
          "& .MuiTab-root.Mui-selected": {
            color: "#85a5c1",          // 選択中文字色
            fontWeight: "bold",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#85a5c1", // 下線の色
          },
        }}
        value={currentTab()}
        onChange={(_, newValue) => {
          if (newValue === 0) navigate("/daily");
          if (newValue === 1) navigate("/weekly");
          if (newValue === 2) navigate("/photo");
        }}
      >
        <Tab label="本日の記録" />
        <Tab label="1週間の記録" />
        <Tab label="写真" />
      </Tabs>
    </Box>
  );
}

export default RecordTabs;
