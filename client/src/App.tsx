import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useUserContext } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoutes";
import AdminLayout from "./layout/admin/AdminLayout";
import Footer from "./layout/Footer";
import GuestProfile from "./layout/guest/GuestProfile";
import Navbar from "./layout/Navbar";
import NotFound from "./pages/_NotFound";
import About from "./pages/About";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Comments from "./pages/admin/Comments";
import ManageAmenities from "./pages/admin/ManageAmenities";
import ManageAreas from "./pages/admin/ManageAreas";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageRooms from "./pages/admin/ManageRooms";
import ManageStaff from "./pages/admin/ManageStaff";
import Reports from "./pages/admin/Reports";
import Reservations from "./pages/admin/Reservations";
import AvailabilityResults from "./pages/AvailabilityResults";
import ConfirmBooking from "./pages/ConfirmBooking";
import ForgotPassword from "./pages/ForgotPassword";
import Homepage from "./pages/Homepage";
import MyBooking from "./pages/MyBooking";
import RegistrationFlow from "./pages/RegistrationFlow";
import RoomDetails from "./pages/RoomDetails";
import Rooms from "./pages/Rooms";
import Venue from "./pages/Venue";

const LoadingHydrate = lazy(() => import("./motions/loaders/LoadingHydrate"));

const App = () => {
  const { isAuthenticated, role } = useUserContext();
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/guest") ||
    location.pathname.startsWith("/registration");

  return (
    <>
      <Suspense fallback={<LoadingHydrate />} />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              role === "admin" || role === "staff" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Homepage />
              )
            ) : (
              <Homepage />
            )
          }
        />

        <Route path="/confirm-booking" element={<ConfirmBooking />} />
        <Route path="/registration" element={<RegistrationFlow />} />
        <Route path="/about" element={<About />} />
        <Route path="/guest/:id" element={<GuestProfile />} />
        <Route path="/venues" element={<Venue />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/availability" element={<AvailabilityResults />} />
        <Route path="/my-booking" element={<MyBooking />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        {/* Protected admin routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="areas" element={<ManageAreas />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="amenities" element={<ManageAmenities />} />
            <Route path="staff" element={<ManageStaff />} />
            <Route path="comments" element={<Comments />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      <Suspense />
    </>
  );
};

export default App;
