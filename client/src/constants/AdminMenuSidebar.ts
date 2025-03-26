import { 
  faGauge,
  faBookBookmark,
  faBed, 
  faUsers,
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
    label: "Manage Bookings",
    link: '/admin/bookings'
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
    label: "Manage Staff",
    link: '/admin/staff'
  },
  {
    icon: faComment,
    label: "Comments",
    link: '/admin/comments'
  },
  {
    icon: faChartLine,
    label: "Reports",
    link: '/admin/reports'
  },
];
