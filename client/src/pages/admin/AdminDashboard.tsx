import { useQuery } from "@tanstack/react-query";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import StatCard from "../../components/admin/StatCard";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import { fetchStats } from "../../services/Admin";
import Error from "../_ErrorBoundary";

Chart.register(BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <Error />;

  const stats = {
    activeBookings: data?.active_bookings || 0,
    availableRooms: data?.available_rooms || 0,
    upcomingReservations: data?.upcoming_reservations || 0,
    revenue: data?.revenue || 0
  }

  const doughnutOptions = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: 40,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const barChartData = {
    labels: ['Bookings', 'Reservations', 'Revenue'],
    datasets: [
      {
        label: 'Statistics',
        data: [stats.activeBookings, stats.upcomingReservations, stats.revenue],
        backgroundColor: ["#4CAF50", "#FFC107", "#FF5722"],
      }
    ]
  };

  const doughnutChartData = {
    labels: ['Available', 'Occupied', 'Maintenance'],
    datasets: [
      {
        data: [data.available_rooms, data.occupied_rooms, data.maintenance_rooms],
        backgroundColor: ["#4CAF50", "#FF5722", "#607D8B"],
      }
    ]
  };

  return (
    <div className="h-[calc(100vh-25px)] p-3 overflow-y-auto container mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Bookings" value={data.active_bookings} borderColor="border-blue-500" />
        <StatCard title="Available Rooms" value={data.available_rooms} borderColor="border-green-500" />
        <StatCard title="Upcoming Reservations" value={data.upcoming_reservations} borderColor="border-yellow-500" />
        <StatCard title="Revenue This Month" value={`$ ${data.revenue}`} borderColor="border-orange-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking & Revenue Trends (Bar Chart) */}
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-center items-center h-full">
          <h2 className="text-xl font-semibold mb-2 text-center">Booking & Revenue Trends</h2>
          <div className="w-full h-80 flex justify-center items-center">
            <Bar data={barChartData} />
          </div>
        </div>

        {/* Room Occupancy (Doughnut Chart) */}
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-center items-center h-full">
          <h2 className="text-xl font-semibold mb-4 text-center">Room Occupancy</h2>
          <div className="w-60 h-60 flex justify-center items-center">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
