import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useUserContext } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoutes";
import useTokenHandler from "./hooks/useTokenHandler";
import AdminLayout from "./layout/admin/AdminLayout";
import Footer from "./layout/Footer";
import Navbar from "./layout/Navbar";

// Import the new PageTransitionLoader
const PageTransitionLoader = lazy(() => import("./motions/loaders/PageTransitionLoader"));
const LoadingHydrate = lazy(() => import("./motions/loaders/LoadingHydrate"));
const NotFound = lazy(() => import("./pages/_NotFound"));
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

const BookingCalendar = lazy(() => import("./pages/BookingCalendar"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Availability = lazy(() => import("./pages/Availability"));
const CancelReservation = lazy(() => import("./pages/CancelReservation"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Comments = lazy(() => import("./pages/admin/Comments"));
const ManageAmenities = lazy(() => import("./pages/admin/ManageAmenities"));
const ManageAreas = lazy(() => import("./pages/admin/ManageAreas"));
const ManageBookings = lazy(() => import("./pages/admin/ManageBookings"));
const ManageRooms = lazy(() => import("./pages/admin/ManageRooms"));
const ManageStaff = lazy(() => import("./pages/admin/ManageStaff"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Reservations = lazy(() => import("./pages/admin/Reservations"));

// Lazy load guest pages
const GuestDashboard = lazy(() => import("./pages/guests/GuestDashboard"));
const Profile = lazy(() => import("./pages/guests/Profile"));
const PaymentHistory = lazy(() => import("./pages/guests/PaymentHistory"));
const LoyaltyProgram = lazy(() => import("./pages/guests/LoyaltyProgram"));
const Invoices = lazy(() => import("./pages/guests/Invoices"));
const RoomSearchAndAvailability = lazy(() => import("./pages/guests/RoomSearchAndAvailability"));

const App = () => {
  const { isAuthenticated, role } = useUserContext();
  const location = useLocation();
  useTokenHandler();

  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/guest") ||
    location.pathname.startsWith("/registration");

  return (
    <>
      {/* Main app suspense - for initial app load */}
      <Suspense fallback={<LoadingHydrate />}>
        {!isAdminRoute && <Navbar />}

        {/* Page-level suspense - for page transitions */}
        <Suspense fallback={<PageTransitionLoader />}>
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
            <Route path="/guest/:id" element={<GuestProfile />} />
            <Route path="/venues" element={<Venue />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/booking/:roomId" element={<BookingCalendar />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/availability/results" element={<AvailabilityResults />} />
            <Route path="/my-booking" element={<MyBooking />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/cancel-reservation" element={<CancelReservation />} />

            {/* Protected guest routes */}
            <Route element={<ProtectedRoute requiredRole="guest" />}>
              <Route path="/guest-dashboard" element={<GuestDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
              <Route path="/loyalty-program" element={<LoyaltyProgram />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/room-search" element={<RoomSearchAndAvailability />} />
            </Route>

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
        </Suspense>

        {!isAdminRoute && <Footer />}
      </Suspense>
    </>
  );
};

export default App;
