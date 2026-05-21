import { HomePage } from "./pages/Homepage.tsx";
import { MainLayout } from "./layouts/MainLayout.tsx";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { FlightsPage } from "./pages/FlightsPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { AdminLayout } from "./admin/layout/AdminLayout.tsx";
import { AdminAircraftPage } from "./admin/features/aircraft/pages/AdminAircraftPage.tsx";
import { AdminRoutesPage } from "./admin/features/routes/pages/AdminRoutesPage.tsx";
import { AdminAirportsPage } from "./admin/features/airports/pages/AdminAirportsPage.tsx";
import { AdminFlightGenerationPage } from "./admin/features/flightGeneration/pages/AdminFlightGenerationPage.tsx";
import { AdminReservationsPage } from "./admin/features/reservations/pages/AdminReservationsPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="flights" element={<FlightsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/aircraft" replace />} />
          <Route path="routes" element={<AdminRoutesPage />} />
          <Route path="aircraft" element={<AdminAircraftPage />} />
          <Route path="locations" element={<AdminAirportsPage />} />
          <Route
            path="flight-generation"
            element={<AdminFlightGenerationPage />}
          />
          <Route path="reservations" element={<AdminReservationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
