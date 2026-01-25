import { AppBar, Toolbar, Typography } from "@mui/material";
import GrassTwoToneIcon from "@mui/icons-material/GrassTwoTone";

const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#9bc185" }} enableColorOnDark>
      <Toolbar sx={{ py: 1.25 }}>
        <GrassTwoToneIcon sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h5">Gardening Lab</Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
