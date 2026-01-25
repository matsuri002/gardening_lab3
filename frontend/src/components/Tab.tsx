import { Tabs, Tab, Box } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const RecordTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plantName } = useParams<{ plantName: string }>();

  const currentTab = () => {
    if (location.pathname.endsWith("/weekly")) return 1;
    if (location.pathname.endsWith("/photo")) return 2;
    return 0;
  };

  if (!plantName) return null;

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
          if (newValue === 0) navigate(`/plants/${plantName}/daily`);
          if (newValue === 1) navigate(`/plants/${plantName}/weekly`);
          if (newValue === 2) navigate(`/plants/${plantName}/photo`);
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
