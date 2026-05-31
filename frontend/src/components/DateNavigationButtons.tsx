import { Button, Box } from "@mui/material";

type Props = {
  onPlantingDateClick: () => void;
  onLastUpdateDateClick: () => void;
  plantingDateDisabled?: boolean;
  lastUpdateDateDisabled?: boolean;
};

const DateNavigationButtons = ({
  onPlantingDateClick,
  onLastUpdateDateClick,
  plantingDateDisabled = false,
  lastUpdateDateDisabled = false,
}: Props) => {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Button
        size="large"
        sx={{ p: { xs: 2.5, sm: 3 }, color: "#85a5c1" }}
        onClick={onPlantingDateClick}
        disabled={plantingDateDisabled}
      >
        栽培開始日
      </Button>
      <Button
        size="large"
        sx={{ p: { xs: 2.5, sm: 3 }, color: "#85a5c1" }}
        onClick={onLastUpdateDateClick}
        disabled={lastUpdateDateDisabled}
      >
        最終更新日
      </Button>
    </Box>
  );
};

export default DateNavigationButtons;
