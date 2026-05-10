import TopPageContainer from "./pages/TopPage";
import SelectPlanterPageContainer from "./pages/SelectPlanterPage";
import DailyRecordPageContainer from "./pages/DailyRecordPage/DailyRecordPage";
import WeeklyRecordPageContainer from "./pages/WeeklyRecordPage/WeeklyRecordPage";
import PhotoPageContainer from "./pages/PhotoPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPageContainer />} />
        <Route path="/select-planter/:plantType" element={<SelectPlanterPageContainer />} />
        <Route path="/plants/:plantType/:plantName/daily" element={<DailyRecordPageContainer />} />
        <Route
          path="/plants/:plantType/:plantName/weekly"
          element={<WeeklyRecordPageContainer />}
        />
        <Route path="/plants/:plantType/:plantName/photo" element={<PhotoPageContainer />} />
      </Routes>
    </BrowserRouter>
  );
}
