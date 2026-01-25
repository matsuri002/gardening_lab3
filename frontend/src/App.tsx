// import TopPageContainer from "./pages/TopPage";
// import SelectPlanterPageContainer from "./pages/SelectPlanterPage";
import DailyRecordPageContainer from "./pages/DailyRecordPage";
import WeeklyRecordPageContainer from "./pages/WeeklyRecordPage";
import PhotoPageContainer from "./pages/PhotoPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DailyRecordPageContainer />} />
        <Route path="/weekly" element={<WeeklyRecordPageContainer />} />
        <Route path="/photo" element={<PhotoPageContainer />} />
      </Routes>
    </BrowserRouter>
  );
}