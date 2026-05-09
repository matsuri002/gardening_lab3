import { Stack, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import RecordTabs from "../../Tab";
import BackButton from "../../BackButton";

type Props = {
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
  plantType?: string;
};

export default function DateSelector({ selectedDate, onDateChange, plantType }: Props) {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {plantType && <BackButton to={`/select-planter/${plantType}`} />}
          <RecordTabs />
        </Stack>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="日付を選択"
            value={selectedDate}
            onChange={(newValue) => {
              if (newValue) onDateChange(newValue);
            }}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
      </Stack>
    </Box>
  );
}
