import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
  to: string;
  label?: string;
};

const BackButton = ({ to, label = "戻る" }: Props) => {
  const navigate = useNavigate();

  return (
    <Button
      size="large"
      sx={{ p: { xs: 2.5, sm: 3 } , color:"#85a5c1"}}
      onClick={() => navigate(to)}
    >
      {label}
    </Button>
  );
};

export default BackButton;
