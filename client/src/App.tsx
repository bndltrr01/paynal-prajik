import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useUserContext } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoutes";
import AdminLayout from "./layout/admin/AdminLayout";
import Footer from "./layout/Footer";
import Navbar from "./layout/Navbar";

const LoadingHydrate = lazy(() => import("./motions/loaders/LoadingHydrate"));
const NotFound = lazy(() => import("./pages/_NotFound"));
const About = lazy(() => import("./pages/About"));
const Homepage = lazy(() => import("./pages/Homepage"));
const AvailabilityResults = lazy(() => import("./pages/AvailabilityResults"));
const ConfirmBooking = lazy(() => import("./pages/ConfirmBooking"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const MyBooking = lazy(() => import("./pages/MyBooking"));
const RegistrationFlow = lazy(() => import("./pages/RegistrationFlow"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const Rooms = lazy(() => import("./pages/Rooms"));
const Venue = lazy(() => import("./pages/Venue"));
const GuestProfile = lazy(() => import("./layout/guest/GuestProfile"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Comments = lazy(() => import("./pages/admin/Comments"));
const ManageAmenities = lazy(() => import("./pages/admin/ManageAmenities"));
const ManageAreas = lazy(() => import("./pages/admin/ManageAreas"));
const ManageBookings = lazy(() => import("./pages/admin/ManageBookings"));
const ManageRooms = lazy(() => import("./pages/admin/ManageRooms"));
const ManageStaff = lazy(() => import("./pages/admin/ManageStaff"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Reservations = lazy(() => import("./pages/admin/Reservations"));

const App = () => {
  const { isAuthenticated, role } = useUserContext();
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/guest") ||
    location.pathname.startsWith("/registration");

  return (
    <>
      <Suspense fallback={<LoadingHydrate />}>
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
      </Suspense>
    </>
  );
};

export default App;
