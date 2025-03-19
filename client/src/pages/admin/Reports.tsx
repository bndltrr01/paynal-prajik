import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import "chart.js/auto";

const ReportsAnalytics = () => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [5000, 6000, 8000, 7500, 9000, 10000],
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const transactionStatusData = {
    labels: ["Completed", "Pending", "Failed"],
    datasets: [
      {
        label: "Transactions",
        data: [70, 20, 10],
        backgroundColor: [
          "rgba(34, 197, 94, 0.7)",
          "rgba(234, 179, 8, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const reviewsData = {
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [
      {
        label: "Review Count",
        data: [5, 10, 20, 40, 25],
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const stayDurationData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Avg. Stay (days)",
        data: [3, 4, 3.5, 5, 4.2, 4],
        backgroundColor: "rgba(96, 165, 250, 0.5)",
        borderColor: "rgba(96, 165, 250, 1)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const bookingCancellationData = {
    labels: ["Confirmed", "Cancelled"],
    datasets: [
      {
        data: [80, 20],
        backgroundColor: ["rgba(34, 197, 94, 0.7)", "rgba(239, 68, 68, 0.7)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const guestData = {
    labels: ["Regular", "VIP"],
    datasets: [
      {
        label: "Guest Types",
        data: [80, 20],
        backgroundColor: ["rgba(234, 179, 8, 0.7)", "rgba(96, 165, 250, 0.7)"],
        borderColor: ["rgba(234, 179, 8, 1)", "rgba(96, 165, 250, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const areaUtilizationData = {
    labels: ["Conference", "Banquet Hall", "Outdoor Area"],
    datasets: [
      {
        label: "Reservations",
        data: [40, 25, 35],
        backgroundColor: [
          "rgba(234, 88, 12, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(59, 130, 246, 0.7)",
        ],
        borderColor: [
          "rgba(234, 88, 12, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(59, 130, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const occupancyData = {
    labels: ["Available", "Occupied", "Maintenance"],
    datasets: [
      {
        label: "Room Status",
        data: [60, 30, 10],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(156, 163, 175, 0.7)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="overflow-y-auto h-[calc(100vh-25px)]">
      <div className="p-3 container mx-auto">
        <motion.h1
          className="text-3xl font-semibold mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Reports & Analytics
        </motion.h1>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <motion.div
            className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Revenue Analytics</h2>
            <div className="flex-grow">
              <Line data={revenueData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Transaction Status</h2>
            <div className="flex-grow">
              <Pie data={transactionStatusData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Room Occupancy</h2>
            <div className="flex-grow">
              <Pie data={occupancyData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <motion.div
            className="bg-white rounded-lg shadow p-4 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
            <div className="flex-grow">
              <Bar data={reviewsData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            className="col-span 1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Avg. Stay Duration</h2>
            <div className="flex-grow">
              <Line data={stayDurationData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <motion.div
            className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">
              Booking vs Cancellation
            </h2>
            <div className="flex-grow">
              <Doughnut
                data={bookingCancellationData}
                options={chartOptions}
              />
            </div>
          </motion.div>

          <motion.div
            className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">Guest Demographics</h2>
            <div className="flex-grow">
              <Bar data={guestData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            className="col-span-1 bg-white rounded-lg shadow p-4 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4">
              Area Reservation Utilization
            </h2>
            <div className="flex-grow">
              <Bar data={areaUtilizationData} options={chartOptions} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
