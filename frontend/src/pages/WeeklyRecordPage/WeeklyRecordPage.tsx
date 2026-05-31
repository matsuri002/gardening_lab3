import { Box, Container, Stack } from "@mui/material";
import RecordTabs from "../../components/Tab";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import { useParams } from "react-router-dom";
import { useWeeklyEnvironment } from "../../hooks/useWeeklyEnvironment/useWeeklyEnvironment";
import { WeeklyDateSelector } from "../../components/WeeklyRecord/WeeklyDateSelector/WeeklyDateSelector";
import { WeeklyCharts } from "../../components/WeeklyRecord/WeeklyCharts/WeeklyCharts";
import { getEnvironmentRepository } from "../../api";
import dayjs from "dayjs";

export default function WeeklyRecordPageContainer() {
  const { plantType, plantName } = useParams<{
    plantType: string;
    plantName: string;
  }>();

  const env = useWeeklyEnvironment(plantName);

  const handlePlantingDateClick = async () => {
    if (!env.plantId) return;
    const dateStr = await getEnvironmentRepository().getEarliestMeasurementDate(env.plantId);
    if (dateStr) env.setEndDate(dayjs(dateStr));
  };

  const handleLastUpdateDateClick = async () => {
    if (!env.plantId) return;
    const dateStr = await getEnvironmentRepository().getLatestMeasurementDate(env.plantId);
    if (dateStr) env.setEndDate(dayjs(dateStr));
  };

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
      <Header />

      <Stack direction="row" spacing={15} alignItems="center">
        <RecordTabs />
        {plantType && <BackButton to={`/select-planter/${plantType}`} />}
      </Stack>

      <Box
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}
        >
          <WeeklyDateSelector
            endDate={env.endDate}
            onDateChange={env.setEndDate}
            onPlantingDateClick={handlePlantingDateClick}
            onLastUpdateDateClick={handleLastUpdateDateClick}
            plantingDateDisabled={!env.plantId}
            lastUpdateDateDisabled={!env.plantId}
          />
          <WeeklyCharts env={env} />
        </Container>
      </Box>
    </Box>
  );
}

