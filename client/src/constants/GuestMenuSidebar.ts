import {
  faHouseUser,
  faCalendarCheck,
  faMapMarkerAlt,
  faUser,
  faFileInvoiceDollar,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";

export const guestMenuItems = [
  {
    icon: faHouseUser,
    label: "Dashboard",
    link: "/guest",
  },
  {
    icon: faCalendarCheck,
    label: "My Bookings",
    link: "/guest/bookings",
  },
  {
    icon: faMapMarkerAlt,
    label: "Area Reservations",
    link: "/guest/areas",
  },
  {
    icon: faUser,
    label: "My Profile",
    link: "/guest/cancellation",
  },
  {
    icon: faFileInvoiceDollar,
    label: "Payments & Invoices",
    link: "/guest/reviews",
  },
  {
    icon: faHeadset,
    label: "Customer Support",
    link: "/guest/reports",
  },
];
