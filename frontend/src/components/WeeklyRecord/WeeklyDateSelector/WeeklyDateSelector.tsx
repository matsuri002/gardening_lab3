import { Typography, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type WeeklyDateSelectorProps = {
  endDate: dayjs.Dayjs;
  onDateChange: (date: dayjs.Dayjs) => void;
};

export const WeeklyDateSelector = ({ endDate, onDateChange }: WeeklyDateSelectorProps) => {
  return (
    <Box sx={{ mb: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="最終日を選択"
          value={endDate}
          onChange={(newValue) => {
            if (newValue) onDateChange(newValue);
          }}
        />
      </LocalizationProvider>
      <Typography variant="subtitle1" color="text.primary" sx={{ mt: 1 }}>
        過去7日間の推移
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {endDate.subtract(6, "day").format("MM/DD")}～{endDate.format("MM/DD")}
      </Typography>
    </Box>
  );
};
