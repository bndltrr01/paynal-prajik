/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import jsPDF from "jspdf";

export interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface ReportData {
  title: string;
  period: string;
  stats: {
    totalBookings: number;
    activeBookings: number;
    revenue: number;
    formattedRevenue: string;
    occupancyRate: string;
    pendingBookings: number;
    checkedInCount: number;
    availableRooms: number;
    totalRooms: number;
  };
  bookingStatusCounts: {
    pending: number;
    reserved: number;
    checked_in: number;
    checked_out: number;
    cancelled: number;
    no_show: number;
    rejected: number;
  };
  charts: {
    revenueData: {
      type: "line";
      data: ChartData;
    };
    bookingTrendsData: {
      type: "line";
      data: ChartData;
    };
    bookingStatusData: {
      type: "pie";
      data: ChartData;
    };
    roomOccupancyData: {
      type: "bar";
      data: ChartData;
    };
  };
}

const drawTitle = (doc: jsPDF, text: string, y: number): number => {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(text, 105, y, { align: "center" });
  return y + 10;
};

const drawSectionHeader = (doc: jsPDF, text: string, y: number): number => {
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y - 5, 180, 10, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(text, 20, y);
  return y + 10;
};

const drawText = (doc: jsPDF, text: string, y: number, x = 20): number => {
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(text, x, y);
  return y + 5;
};

const drawKPI = (
  doc: jsPDF,
  title: string,
  value: string | number,
  x: number,
  y: number,
  width = 40
): number => {
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(x, y, width, 25, 3, 3, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(title, x + 5, y + 8);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(value.toString(), x + 5, y + 18);

  return y + 30;
};

const addChartImage = (
  doc: jsPDF,
  chartCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): number => {
  const imgData = chartCanvas.toDataURL("image/png");
  doc.addImage(imgData, "PNG", x, y, width, height);
  return y + height + 10;
};

const drawDivider = (doc: jsPDF, y: number): number => {
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
  return y + 5;
};

const getCurrentMonthYear = (): string => {
  return format(new Date(), "MMMM yyyy");
};

export const generateMonthlyReport = async (
  reportData: ReportData,
  charts: { [key: string]: HTMLCanvasElement }
): Promise<void> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, "F");

  let y = 15;
  doc.setTextColor(33, 150, 243);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Azurea Hotel Management System", 105, y, { align: "center" });

  y += 10;
  doc.setTextColor(0, 0, 0);
  y = drawTitle(doc, "Monthly Performance Report", y);

  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.text(reportData.period || getCurrentMonthYear(), 105, y, {
    align: "center",
  });

  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 105, y, {
    align: "center",
  });

  y += 15;

  y = drawSectionHeader(doc, "1. Key Performance Indicators", y);
  y += 5;

  drawKPI(doc, "Total Bookings", reportData.stats.totalBookings, 20, y, 40);
  drawKPI(doc, "Active Bookings", reportData.stats.activeBookings, 70, y, 40);
  drawKPI(doc, "Total Revenue", reportData.stats.formattedRevenue, 120, y, 40);
  drawKPI(doc, "Occupancy Rate", reportData.stats.occupancyRate, 170, y, 40);

  y += 30;

  drawKPI(doc, "Pending Bookings", reportData.stats.pendingBookings, 20, y, 40);
  drawKPI(doc, "Checked-in Guests", reportData.stats.checkedInCount, 70, y, 40);
  drawKPI(doc, "Available Rooms", reportData.stats.availableRooms, 120, y, 40);
  drawKPI(doc, "Total Rooms", reportData.stats.totalRooms, 170, y, 40);

  y += 35;
  y = drawDivider(doc, y);

  y = drawSectionHeader(doc, "2. Revenue & Booking Trends", y);
  y += 5;

  if (charts.revenueChart) {
    y = addChartImage(doc, charts.revenueChart, 20, y, 170, 70);
  } else {
    y = drawText(doc, "Revenue chart data not available", y);
    y += 70;
  }

  if (charts.bookingTrendsChart) {
    y = addChartImage(doc, charts.bookingTrendsChart, 20, y, 170, 70);
  } else {
    y = drawText(doc, "Booking trends chart data not available", y);
    y += 70;
  }

  if (y > 250) {
    doc.addPage();
    y = 20;
  } else {
    y = drawDivider(doc, y);
  }

  y = drawSectionHeader(doc, "3. Booking Status Distribution", y);
  y += 5;

  if (charts.bookingStatusChart) {
    y = addChartImage(doc, charts.bookingStatusChart, 55, y, 100, 80);
  } else {
    y = drawText(doc, "Booking status chart data not available", y);
    y += 80;
  }

  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Booking Status Breakdown:", 20, y);
  y += 8;

  const statusLabels = [
    { key: "pending", label: "Pending" },
    { key: "reserved", label: "Reserved" },
    { key: "checked_in", label: "Checked In" },
    { key: "checked_out", label: "Checked Out" },
    { key: "cancelled", label: "Cancelled" },
    { key: "no_show", label: "No Show" },
    { key: "rejected", label: "Rejected" },
  ];

  statusLabels.forEach((status) => {
    const count =
      reportData.bookingStatusCounts[
        status.key as keyof typeof reportData.bookingStatusCounts
      ];
    y = drawText(doc, `${status.label}: ${count}`, y, 30);
  });

  if (y > 250) {
    doc.addPage();
    y = 20;
  } else {
    y = drawDivider(doc, y);
  }

  y = drawSectionHeader(doc, "4. Room Occupancy", y);
  y += 5;

  if (charts.roomOccupancyChart) {
    y = addChartImage(doc, charts.roomOccupancyChart, 20, y, 170, 70);
  } else {
    y = drawText(doc, "Room occupancy chart data not available", y);
    y += 70;
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Confidential - For internal use only", 105, 285, {
    align: "center",
  });
  doc.text("© Paynal Prajik Hotel Management System", 105, 290, {
    align: "center",
  });

  doc.save(`Hotel_Monthly_Report_${format(new Date(), "yyyy-MM")}.pdf`);
};

export const prepareReportData = (
  dashboardData: any,
  bookingStatusData: any,
  currentMonth = getCurrentMonthYear()
): ReportData => {
  const occupancyRate =
    dashboardData.total_rooms > 0
      ? Math.round(
          (dashboardData.occupied_rooms / dashboardData.total_rooms) * 100
        )
      : 0;

  return {
    title: "Monthly Performance Report",
    period: currentMonth,
    stats: {
      totalBookings: dashboardData.total_bookings || 0,
      activeBookings: dashboardData.active_bookings || 0,
      revenue: dashboardData.revenue || 0,
      formattedRevenue: dashboardData.formatted_revenue || "₱0.00",
      occupancyRate: `${occupancyRate}%`,
      pendingBookings: dashboardData.pending_bookings || 0,
      checkedInCount: dashboardData.checked_in_count || 0,
      availableRooms: dashboardData.available_rooms || 0,
      totalRooms: dashboardData.total_rooms || 0,
    },
    bookingStatusCounts: {
      pending: bookingStatusData?.pending || 0,
      reserved: bookingStatusData?.reserved || 0,
      checked_in: bookingStatusData?.checked_in || 0,
      checked_out: bookingStatusData?.checked_out || 0,
      cancelled: bookingStatusData?.cancelled || 0,
      no_show: bookingStatusData?.no_show || 0,
      rejected: bookingStatusData?.rejected || 0,
    },
    charts: {
      revenueData: {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
            },
          ],
        },
      },
      bookingTrendsData: {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
            },
          ],
        },
      },
      bookingStatusData: {
        type: "pie",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
            },
          ],
        },
      },
      roomOccupancyData: {
        type: "bar",
        data: {
          labels: [],
          datasets: [
            {
              data: [],
            },
          ],
        },
      },
    },
  };
};
