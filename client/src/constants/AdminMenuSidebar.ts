import { 
  faGauge,
  faBookBookmark,
  faBed, 
  faUsers, 
  faMapMarkerAlt,
  faChartLine,
  faComment,
  faConciergeBell,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

export const menuItems = [
  {
    icon: faGauge, 
    label: "Dashboard",
    link: '/admin'
  },
  {
    icon: faBookBookmark,
    label: "Bookings",
    link: '/admin/bookings'
  },
  {
    icon: faMapMarkerAlt,
    label: "Reservations",
    link: '/admin/reservations'
  },
  {
    icon: faCalendarCheck, 
    label: "Manage Areas",
    link: '/admin/areas'
  },
  {
    icon: faBed,
    label: "Manage Rooms",
    link: '/admin/rooms'
  },
  {
    icon: faConciergeBell,
    label: "Manage Amenities",
    link: '/admin/amenities'
  },
  {
    icon: faUsers,
    label: "Manage Users",
    link: '/admin/users'
  },
  {
    icon: faComment,
    label: "Comments/Feedback",
    link: '/admin/comments'
  },
  {
    icon: faChartLine,
    label: "Reports & Analytics",
    link: '/admin/reports'
  },
];
