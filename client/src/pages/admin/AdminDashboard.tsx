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
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import StatCard from "../../components/admin/StatCard";
import DashboardSkeleton from "../../motions/skeletons/AdminDashboardSkeleton";
import { fetchBookingStatusCounts, fetchStats } from "../../services/Admin";
import Error from "../_ErrorBoundary";

Chart.register(BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  const { data: bookingStatusData, isLoading: bookingStatusLoading } = useQuery({
    queryKey: ['bookingStatusCounts'],
    queryFn: fetchBookingStatusCounts,
  });

  if (isLoading || bookingStatusLoading) return <DashboardSkeleton />;
  if (error) return <Error />;

  const stats = {
    activeBookings: data?.active_bookings || 0,
    availableRooms: data?.available_rooms || 0,
    upcomingReservations: data?.upcoming_reservations || 0,
    revenue: data?.revenue || 0,
    roomRevenue: data?.room_revenue || 0,
    venueRevenue: data?.venue_revenue || 0,
    formattedRevenue: data?.formatted_revenue || "₱0.00",
    formattedRoomRevenue: data?.formatted_room_revenue || "₱0.00",
    formattedVenueRevenue: data?.formatted_venue_revenue || "₱0.00"
  }

  const bookingStatusCounts = {
    pending: bookingStatusData?.pending || 0,
    reserved: bookingStatusData?.reserved || 0,
    checked_in: bookingStatusData?.checked_in || 0,
    checked_out: bookingStatusData?.checked_out || 0,
    cancelled: bookingStatusData?.cancelled || 0,
    no_show: bookingStatusData?.no_show || 0,
    rejected: bookingStatusData?.rejected || 0
  };

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

  const pieOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value * 100) / total).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  }

  const bookingBarChartData = {
    labels: ['Active Bookings', 'Area Reservations'],
    datasets: [
      {
        label: 'Booking Statistics',
        data: [stats.activeBookings, stats.upcomingReservations],
        backgroundColor: ["#4CAF50", "#FFC107"],
      }
    ]
  };

  const revenueBarChartData = {
    labels: ['Revenue This Month'],
    datasets: [
      {
        label: 'Revenue (in ₱)',
        data: [stats.revenue],
        backgroundColor: ["#FF5722"],
      }
    ]
  };

  const revenueBreakdownData = {
    labels: ['Room Bookings', 'Venue Rentals'],
    datasets: [
      {
        label: 'Revenue by Type (₱)',
        data: [stats.roomRevenue, stats.venueRevenue],
        backgroundColor: ["#3F51B5", "#E91E63"],
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

  const bookingStatusChartData = {
    labels: ['Pending', 'Reserved', 'Checked In', 'Checked Out', 'Cancelled', 'No Show', 'Rejected'],
    datasets: [
      {
        data: [
          bookingStatusCounts.pending,
          bookingStatusCounts.reserved,
          bookingStatusCounts.checked_in,
          bookingStatusCounts.checked_out,
          bookingStatusCounts.cancelled,
          bookingStatusCounts.no_show,
          bookingStatusCounts.rejected
        ],
        backgroundColor: [
          "#FFC107",
          "#2196F3",
          "#4CAF50",
          "#9E9E9E",
          "#F44336",
          "#9C27B0",
          "#FF5722"
        ],
        borderWidth: 1,
      }
    ]
  };

  const getRevenueBreakdownDescription = () => {
    if (stats.roomRevenue > 0 && stats.venueRevenue > 0) {
      return `Revenue from both room bookings and venue rentals`;
    } else if (stats.roomRevenue > 0 && stats.venueRevenue === 0) {
      return `Currently all revenue is from room bookings`;
    } else if (stats.venueRevenue > 0 && stats.roomRevenue === 0) {
      return `Currently all revenue is from venue bookings`;
    } else {
      return `No revenue recorded yet`;
    }
  };

  return (
    <div className="h-[calc(100vh-25px)] p-3 overflow-y-auto container mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Bookings" value={data.active_bookings} borderColor="border-blue-500" />
        <StatCard title="Available Rooms" value={data.available_rooms} borderColor="border-green-500" />
        <StatCard title="Area Reservations" value={data.upcoming_reservations} borderColor="border-yellow-500" />
        <StatCard title="Revenue This Month" value={stats.formattedRevenue} borderColor="border-orange-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Room Occupancy (Doughnut Chart) */}
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-center items-center h-full">
          <h2 className="text-xl font-semibold mb-4 text-center">Room Occupancy</h2>
          <div className="w-60 h-60 flex justify-center items-center">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Booking Trends (Bar Chart) */}
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-center items-center h-full">
          <h2 className="text-xl font-semibold mb-2 text-center">Booking Trends</h2>
          <div className="w-full h-60 flex justify-center items-center">
            <Bar data={bookingBarChartData} />
          </div>
        </div>

        {/* Revenue Trend (Bar Chart) */}
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-center items-center h-full">
          <h2 className="text-xl font-semibold mb-2 text-center">Revenue Trend</h2>
          <div className="w-full h-60 flex justify-center items-center">
            <Bar data={revenueBarChartData} />
          </div>
        </div>

        {/* Revenue Breakdown (Bar Chart) */}
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-center items-center h-full">
          <h2 className="text-xl font-semibold mb-2 text-center">Revenue Breakdown</h2>
          <div className="w-full h-60 flex flex-col justify-center items-center">
            <Bar
              data={revenueBreakdownData}
              options={{
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          // Use formatted values for tooltips
                          const index = context.dataIndex;
                          if (index === 0) {
                            return `${label}${stats.formattedRoomRevenue}`;
                          } else if (index === 1) {
                            return `${label}${stats.formattedVenueRevenue}`;
                          }
                          return `${label}₱${context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                        return label;
                      }
                    }
                  }
                }
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              {getRevenueBreakdownDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Status Distribution (Pie Chart) */}
      <div className="grid grid-cols-1 bg-white shadow-lg rounded-lg p-4 mb-6">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-6 text-center">Booking Status Distribution</h2>
          <div className="w-full max-w-2xl h-80 flex justify-center items-center">
            <Pie data={bookingStatusChartData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
