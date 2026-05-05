import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export type ViewMode = "standard" | "processed";

type Props = {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
  size?: "small" | "medium" | "large";
  labels?: { standard: string; processed: string };
  disabled?: boolean;
};

export default function ViewModeToggle({
  value,
  onChange,
  size = "small",
  labels = { standard: "時系列", processed: "集計" },
  disabled = false,
}: Props) {
  return (
    <ToggleButtonGroup
      size={size}
      value={value}
      exclusive
      disabled={disabled}
      onChange={(_, v) => {
        // exclusive のとき、同じボタンを押すと null が返るのでガード
        if (!v) return;
        onChange(v as ViewMode);
      }}
    >
      <ToggleButton value="standard">{labels.standard}</ToggleButton>
      <ToggleButton value="processed">{labels.processed}</ToggleButton>
    </ToggleButtonGroup>
  );
}
