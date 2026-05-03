import { HomePage } from "./pages/Homepage.tsx";
import { MainLayout } from "./layouts/MainLayout.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FlightsPage } from "./pages/FlightsPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
