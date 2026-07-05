import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Homepage.tsx";
import { FlightsPage } from "./pages/FlightsPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { MainLayout } from "./layouts/MainLayout.tsx";
import { AdminLayout } from "./admin/layout/AdminLayout.tsx";
import { AdminAircraftPage } from "./admin/features/aircraft/pages/AdminAircraftPage.tsx";
import { AdminRoutesPage } from "./admin/features/routes/pages/AdminRoutesPage.tsx";
import { AdminAirportsPage } from "./admin/features/airports/pages/AdminAirportsPage.tsx";
import { AdminFlightGenerationPage } from "./admin/features/flightGeneration/pages/AdminFlightGenerationPage.tsx";
import { AdminFlightsPage } from "./admin/features/flights/pages/AdminFlightsPage.tsx";
import { AdminPassengersPage } from "./admin/features/passengers/pages/AdminPassengersPage.tsx";
import { AdminReservationsPage } from "./admin/features/reservations/pages/AdminReservationsPage.tsx";
import { LoginPage } from "./auth/pages/LoginPage.tsx";
import { RequireAdmin } from "./auth/components/RequireAdmin.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="flights" element={<FlightsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/admin/aircraft" replace />} />
        <Route path="routes" element={<AdminRoutesPage />} />
        <Route path="aircraft" element={<AdminAircraftPage />} />
        <Route path="locations" element={<AdminAirportsPage />} />
        <Route path="flights" element={<AdminFlightsPage />} />
        <Route path="passengers" element={<AdminPassengersPage />} />
        <Route
          path="flight-generation"
          element={<AdminFlightGenerationPage />}
        />
        <Route path="reservations" element={<AdminReservationsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
