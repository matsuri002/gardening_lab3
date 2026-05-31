import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

type Props = {
  selectedDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
};

export default function DateSelector({ selectedDate, onDateChange }: Props) {
  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="日付を選択"
          value={selectedDate}
          onChange={(newValue) => {
            if (newValue) onDateChange(newValue);
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
