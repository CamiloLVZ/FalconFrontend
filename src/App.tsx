import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Homepage.tsx";
import { MainLayout } from "./layouts/MainLayout.tsx";
import { LoginPage } from "./auth/pages/LoginPage.tsx";
import { RequireAdmin } from "./auth/components/RequireAdmin.tsx";
import { RequireAuth } from "./auth/components/RequireAuth.tsx";
import { LoadingScreen } from "./components/common/LoadingScreen.tsx";

const FlightsPage = lazy(() => import("./pages/FlightsPage.tsx").then(m => ({ default: m.FlightsPage })));
const BookingPage = lazy(() => import("./pages/BookingPage.tsx").then(m => ({ default: m.BookingPage })));
const ManageReservationPage = lazy(() => import("./pages/ManageReservationPage.tsx").then(m => ({ default: m.ManageReservationPage })));
const CheckInPage = lazy(() => import("./pages/CheckInPage.tsx").then(m => ({ default: m.CheckInPage })));
const BoardingPage = lazy(() => import("./pages/BoardingPage.tsx").then(m => ({ default: m.BoardingPage })));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage.tsx").then(m => ({ default: m.UserProfilePage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx").then(m => ({ default: m.NotFoundPage })));
const AdminLayout = lazy(() => import("./admin/layout/AdminLayout.tsx").then(m => ({ default: m.AdminLayout })));
const AdminAircraftPage = lazy(() => import("./admin/features/aircraft/pages/AdminAircraftPage.tsx").then(m => ({ default: m.AdminAircraftPage })));
const AdminRoutesPage = lazy(() => import("./admin/features/routes/pages/AdminRoutesPage.tsx").then(m => ({ default: m.AdminRoutesPage })));
const AdminAirportsPage = lazy(() => import("./admin/features/airports/pages/AdminAirportsPage.tsx").then(m => ({ default: m.AdminAirportsPage })));
const AdminFlightGenerationPage = lazy(() => import("./admin/features/flightGeneration/pages/AdminFlightGenerationPage.tsx").then(m => ({ default: m.AdminFlightGenerationPage })));
const AdminFlightsPage = lazy(() => import("./admin/features/flights/pages/AdminFlightsPage.tsx").then(m => ({ default: m.AdminFlightsPage })));
const AdminPassengersPage = lazy(() => import("./admin/features/passengers/pages/AdminPassengersPage.tsx").then(m => ({ default: m.AdminPassengersPage })));
const AdminReservationsPage = lazy(() => import("./admin/features/reservations/pages/AdminReservationsPage.tsx").then(m => ({ default: m.AdminReservationsPage })));
const AdminUsersPage = lazy(() => import("./admin/features/users/pages/AdminUsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminCheckInPage = lazy(() => import("./admin/features/checkin/pages/AdminCheckInPage.tsx").then(m => ({ default: m.AdminCheckInPage })));
const AdminBoardingPage = lazy(() => import("./admin/features/boarding/pages/AdminBoardingPage.tsx").then(m => ({ default: m.AdminBoardingPage })));

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="flights" element={<Suspense fallback={<LoadingScreen />}><FlightsPage /></Suspense>} />
        <Route path="booking/:flightId" element={<Suspense fallback={<LoadingScreen />}><BookingPage /></Suspense>} />
        <Route path="manage" element={<Suspense fallback={<LoadingScreen />}><ManageReservationPage /></Suspense>} />
        <Route path="check-in" element={<Suspense fallback={<LoadingScreen />}><CheckInPage /></Suspense>} />
        <Route path="boarding" element={<Suspense fallback={<LoadingScreen />}><BoardingPage /></Suspense>} />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <Suspense fallback={<LoadingScreen />}>
                <UserProfilePage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<Suspense fallback={<LoadingScreen />}><NotFoundPage /></Suspense>} />
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
