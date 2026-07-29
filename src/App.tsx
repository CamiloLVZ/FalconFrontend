import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Homepage.tsx";
import { FlightsPage } from "./pages/FlightsPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { MainLayout } from "./layouts/MainLayout.tsx";
import { LoginPage } from "./auth/pages/LoginPage.tsx";
import { RequireAdmin } from "./auth/components/RequireAdmin.tsx";
import { LoadingScreen } from "./components/common/LoadingScreen.tsx";

const AdminLayout = lazy(() => import("./admin/layout/AdminLayout.tsx"));
const AdminAircraftPage = lazy(() => import("./admin/features/aircraft/pages/AdminAircraftPage.tsx"));
const AdminRoutesPage = lazy(() => import("./admin/features/routes/pages/AdminRoutesPage.tsx"));
const AdminAirportsPage = lazy(() => import("./admin/features/airports/pages/AdminAirportsPage.tsx"));
const AdminFlightGenerationPage = lazy(() => import("./admin/features/flightGeneration/pages/AdminFlightGenerationPage.tsx"));
const AdminFlightsPage = lazy(() => import("./admin/features/flights/pages/AdminFlightsPage.tsx"));
const AdminPassengersPage = lazy(() => import("./admin/features/passengers/pages/AdminPassengersPage.tsx"));
const AdminReservationsPage = lazy(() => import("./admin/features/reservations/pages/AdminReservationsPage.tsx"));
const AdminUsersPage = lazy(() => import("./admin/features/users/pages/AdminUsersPage"));
const AdminCheckInPage = lazy(() => import("./admin/features/checkin/pages/AdminCheckInPage.tsx"));
const AdminBoardingPage = lazy(() => import("./admin/features/boarding/pages/AdminBoardingPage.tsx"));

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
            <Suspense fallback={<LoadingScreen />}>
              <AdminLayout />
            </Suspense>
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
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="checkin" element={<AdminCheckInPage />} />
        <Route path="boarding" element={<AdminBoardingPage />} />
      </Route>
    </Routes>
  );
}

export default App;
