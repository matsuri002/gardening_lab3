import { Box, Container, CircularProgress, Backdrop, Stack } from "@mui/material";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useParams } from "react-router-dom";
import RecordTabs from "../../components/Tab";
import Header from "../../components/Header";
import BackButton from "../../components/BackButton";
import DateNavigationButtons from "../../components/DateNavigationButtons";
import { useDailyEnvironment } from "../../hooks/useDailyEnvironment/useDailyEnvironment";
import DateSelector from "../../components/DailyRecord/DateSelector/DateSelector";
import EnvironmentSummary from "../../components/DailyRecord/EnvironmentSummary/EnvironmentSummary";
import AdviceSection from "../../components/DailyRecord/AdviceSection/AdviceSection";
import DailyCharts from "../../components/DailyRecord/DailyCharts/DailyCharts";
import { getEnvironmentRepository } from "../../api";

export default function DailyRecordPageContainer() {
  const { plantType, plantName } = useParams<{
    plantType: string;
    plantName: string;
  }>();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const {
    loading,
    envData,
    measuredAt,
    noDataMessage,
    soilTempDaily,
    soilMoistureDaily,
    roomTempDaily,
    roomHumidDaily,
    lightDaily,
    ecData,
    co2Daily,
    latestCo2,
    adviceText,
    daysFromStart,
    plantId,
  } = useDailyEnvironment(plantName, selectedDate);

  const handlePlantingDateClick = async () => {
    if (!plantId) return;
    const dateStr = await getEnvironmentRepository().getEarliestMeasurementDate(plantId);
    if (dateStr) setSelectedDate(dayjs(dateStr));
  };

  const handleLastUpdateDateClick = async () => {
    if (!plantId) return;
    const dateStr = await getEnvironmentRepository().getLatestMeasurementDate(plantId);
    if (dateStr) setSelectedDate(dayjs(dateStr));
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
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 2,
          ml: 4,
          mt: 3,
        }}
      >
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <DateNavigationButtons
          onPlantingDateClick={handlePlantingDateClick}
          onLastUpdateDateClick={handleLastUpdateDateClick}
          plantingDateDisabled={!plantId}
          lastUpdateDateDisabled={!plantId}
        />
      </Box>

      <Box
        component="main"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}
        >
          <AdviceSection adviceText={adviceText} daysFromStart={daysFromStart} />

          <EnvironmentSummary
            envData={envData}
            ecData={ecData}
            latestCo2={latestCo2}
            measuredAt={measuredAt}
            noDataMessage={noDataMessage}
          />

          <DailyCharts
            soilTempDaily={soilTempDaily}
            soilMoistureDaily={soilMoistureDaily}
            roomTempDaily={roomTempDaily}
            roomHumidDaily={roomHumidDaily}
            lightDaily={lightDaily}
            co2Daily={co2Daily}
            daysFromStart={daysFromStart}
          />
        </Container>
      </Box>

      <Backdrop open={loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
