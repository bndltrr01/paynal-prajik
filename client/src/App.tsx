import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useUserContext } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoutes";
import AdminLayout from "./layout/admin/AdminLayout";
import Footer from "./layout/Footer";
import Navbar from "./layout/Navbar";
import ScrollToTop from "./components/ScrollToTop";

// Import the new PageTransitionLoader
const PageTransitionLoader = lazy(() => import("./motions/loaders/PageTransitionLoader"));
const LoadingHydrate = lazy(() => import("./motions/loaders/LoadingHydrate"));
const NotFound = lazy(() => import("./pages/_NotFound"));
const Homepage = lazy(() => import("./pages/Homepage"));
const AvailabilityResults = lazy(() => import("./pages/AvailabilityResults"));
const ConfirmBooking = lazy(() => import("./pages/ConfirmBooking"));
const ConfirmVenueBooking = lazy(() => import("./pages/ConfirmVenueBooking"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const RegistrationFlow = lazy(() => import("./pages/RegistrationFlow"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const Rooms = lazy(() => import("./pages/Rooms"));
const Venue = lazy(() => import("./pages/Venue"));
const GuestProfile = lazy(() => import("./layout/guest/GuestProfile"));

const BookingCalendar = lazy(() => import("./pages/BookingCalendar"));
const VenueBookingCalendar = lazy(() => import("./pages/VenueBookingCalendar"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const CancelReservation = lazy(() => import("./pages/CancelReservation"));
const VenueDetails = lazy(() => import("./pages/VenueDetails"));

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
const GuestBookings = lazy(() => import("./pages/guests/GuestBookings"));
const GuestReservations = lazy(() => import("./pages/guests/GuestReservations"));
const GuestCancellations = lazy(() => import("./pages/guests/GuestCancellations"));
const PaymentHistory = lazy(() => import("./pages/guests/PaymentHistory"));
const GuestLayout = lazy(() => import("./layout/guest/GuestLayout"));

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
        <ScrollToTop />

        <Suspense fallback={<PageTransitionLoader />}>
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

            <Route path="/confirm-booking" element={<ConfirmBooking />} />
            <Route path="/confirm-venue-booking" element={<ConfirmVenueBooking />} />
            <Route path="/registration" element={<RegistrationFlow />} />

            {/* Legacy guest profile route for compatibility */}
            <Route path="/guest/:id" element={<GuestProfile />} />

            <Route path="/venues" element={<Venue />} />
            <Route path="/venues/:id" element={<VenueDetails />} />
            <Route path="/venue-booking/:areaId" element={<VenueBookingCalendar />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/booking/:roomId" element={<BookingCalendar />} />
            <Route path="/availability" element={<AvailabilityResults />} />

            {/* Redirect from MyBooking to the GuestBookings page */}
            <Route
              path="/my-booking"
              element={
                isAuthenticated ?
                  <Navigate to="/guest/bookings" replace /> :
                  <GuestBookings />
              }
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/cancel-reservation" element={<CancelReservation />} />

            {/* Protected guest routes with GuestLayout */}
            <Route element={<ProtectedRoute requiredRole="guest" />}>
              <Route path="/guest" element={<GuestLayout />}>
                <Route index element={<GuestDashboard />} />
                <Route path="bookings" element={<GuestBookings />} />
                <Route path="reservations" element={<GuestReservations />} />
                <Route path="cancellations" element={<GuestCancellations />} />
                <Route path="payments" element={<PaymentHistory />} />
                <Route path="reviews" element={<GuestDashboard />} /> {/* Placeholder for future reviews page */}
              </Route>
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
