import AOS from "aos";
import { Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import ScrollToTop from "./components/ScrollToTop";
import { useUserContext } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoutes";
import useTokenHandler from "./hooks/useTokenHandler";
import AdminLayout from "./layout/admin/AdminLayout";
import GuestProfile from "./layout/guest/GuestProfile";
import LoadingHydrate from "./motions/loaders/LoadingHydrate";
import NotFound from "./pages/_NotFound";
import About from "./pages/About";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Reservations from "./pages/admin/Reservations";
import Comments from "./pages/admin/Comments";
import ManageAmenities from "./pages/admin/ManageAmenities";
import ManageAreas from "./pages/admin/ManageAreas";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageRooms from "./pages/admin/ManageRooms";
import ManageUsers from "./pages/admin/ManageUsers";
import Reports from "./pages/admin/Reports";
import Availability from "./pages/Availability";
import ForgotPassword from "./pages/ForgotPassword";
import Homepage from "./pages/Homepage";
import MyBooking from "./pages/MyBooking";
import RegistrationFlow from "./pages/RegistrationFlow";
import Rooms from "./pages/Rooms";
import Venue from "./pages/Venue";

const App = () => {
  const { isAuthenticated, role, loading } = useUserContext();
  useTokenHandler();

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-in-out",
    });
  }, []);

  if (loading) return <LoadingHydrate />;

  return (
    <Suspense fallback={<LoadingHydrate />}>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Homepage />
              )
            ) : (
              <Homepage />
            )
          }
        />
        <Route path="/guest/:id" element={<GuestProfile />} />
        <Route path="/registration" element={<RegistrationFlow />} />
        <Route path="/about" element={<About />} />
        <Route path="/venues" element={<Venue />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/mybooking" element={<MyBooking />} />
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
            <Route path="users" element={<ManageUsers />} />
            <Route path="comments" element={<Comments />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
