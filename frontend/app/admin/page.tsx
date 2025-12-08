"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getSummary,
  getRevenue,
  getTopCars,
  getTopPlans,
  getBookingStats,
} from "@/services/reportServices";
import { getAllCar } from "@/services/carServices";
import { getAllRentalPlans } from "@/services/rentalPlanServices";

// ----- Types -----
type RevenueItem = { label: string; revenue: number; bookings: number };
type Car = { carId: number; name: string };
type RentalPlan = { planId: number; carId: number; carName: string; durationType: string };
type Summary = { totalRevenue: number; totalBookings: number; activeCars: number };
type TopCar = { carName: string; bookedCount: number };
type TopPlan = { plan: string; count: number };

export default function AdminDashboard() {
  // ----- State -----
  const [summary, setSummary] = useState<Summary>({ totalRevenue: 0, totalBookings: 0, activeCars: 0 });
  const [chartData, setChartData] = useState<RevenueItem[]>([]);
  const [groupBy, setGroupBy] = useState<"day" | "month" | "year">("month");
  const [topCars, setTopCars] = useState<TopCar[]>([]);
  const [topPlans, setTopPlans] = useState<TopPlan[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [plans, setPlans] = useState<RentalPlan[]>([]);
  const [filterCarId, setFilterCarId] = useState<number | undefined>(undefined);
  const [filterPlanId, setFilterPlanId] = useState<number | undefined>(undefined);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // ----- Load Data -----
  const loadDashboard = useCallback(async () => {
    try {
      const sum = await getSummary();
      setSummary(sum);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  }, []);

  const loadRevenue = useCallback(async () => {
    try {
      setLoadingRevenue(true);

      const revenueRaw = await getRevenue({ groupBy, carId: filterCarId, planId: filterPlanId });
      const bookingsRaw = await getBookingStats({ carId: filterCarId, planId: filterPlanId });

      const revenueMap: Record<string, RevenueItem> = {};

      // Xử lý revenue
      revenueRaw.forEach((item: any) => {
        let label = item.label;
        const revenue = item.revenue ?? item.value ?? item.Revenue ?? 0;
        const d = new Date(label);

        if (!isNaN(d.getTime())) {
          if (groupBy === "day") label = d.toISOString().split("T")[0];
          else if (groupBy === "month")
            label = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
          else if (groupBy === "year") label = `${d.getFullYear()}`;
        } else {
          label = "Unknown"; // nếu label không hợp lệ
        }

        revenueMap[label] = { label, revenue, bookings: 0 };
      });

      // Xử lý bookings
      bookingsRaw.forEach((item: any) => {
        let label = item.label;
        const count = item.count ?? 0;
        const d = new Date(label);

        if (!isNaN(d.getTime())) {
          if (groupBy === "day") label = d.toISOString().split("T")[0];
          else if (groupBy === "month")
            label = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
          else if (groupBy === "year") label = `${d.getFullYear()}`;
        } else {
          label = "Unknown";
        }

        if (revenueMap[label]) revenueMap[label].bookings = count;
        else revenueMap[label] = { label, revenue: 0, bookings: count };
      });

      // Tạo chart labels mặc định
      const today = new Date();
      const chartLabels: string[] =
        groupBy === "day"
          ? Array.from({ length: 9 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() + i - 4);
            return d.toISOString().split("T")[0];
          })
          : groupBy === "month"
            ? Array.from({ length: 12 }, (_, i) => `${today.getFullYear()}-${(i + 1).toString().padStart(2, "0")}`)
            : Array.from({ length: 9 }, (_, i) => `${today.getFullYear() - 2 + i}`);

      setChartData(
        chartLabels.map((label) => revenueMap[label] ?? { label, revenue: 0, bookings: 0 })
      );
    } catch (err) {
      console.error("Revenue load error:", err);
    } finally {
      setLoadingRevenue(false);
    }
  }, [groupBy, filterCarId, filterPlanId]);

  const loadTopCars = useCallback(async () => {
    try {
      const top = await getTopCars(5);
      setTopCars(top);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadTopPlans = useCallback(async () => {
    try {
      const top = await getTopPlans(5);
      setTopPlans(top);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadCars = useCallback(async () => {
    try {
      const data = await getAllCar();
      setCars(data);
    } catch (err) {
      console.error("Load cars error:", err);
    }
  }, []);

  const loadRentalPlans = useCallback(async () => {
    try {
      const data = await getAllRentalPlans();
      setPlans(data);
    } catch (err) {
      console.error("Load rental plans error:", err);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadCars();
    loadRentalPlans();
  }, [loadDashboard, loadCars, loadRentalPlans]);

  useEffect(() => {
    loadRevenue();
    loadTopCars();
    loadTopPlans();
  }, [loadRevenue, loadTopCars, loadTopPlans]);

  // ----- Render -----
  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-6">Admin Dashboard</h2>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Tổng doanh thu", value: `${summary.totalRevenue.toLocaleString()} đ` },
          { label: "Tổng đơn đặt", value: summary.totalBookings },
          { label: "Số loại xe đang hoạt động", value: summary.activeCars },
        ].map((item, i) => (
          <div key={i} className="bg-white shadow-md p-6 rounded-xl border hover:shadow-lg transition">
            <h3 className="text-gray-500">{item.label}</h3>
            <p className="text-3xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white shadow-md p-6 rounded-xl border mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h3 className="text-xl font-semibold">Doanh thu</h3>

          <div className="flex gap-2 items-center">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "day" | "month" | "year")}
              className="border px-3 py-2 rounded-md"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>

            <select
              value={filterCarId ?? ""}
              onChange={(e) => setFilterCarId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border px-3 py-2 rounded-md"
            >
              <option value="">Tất cả xe</option>
              {cars.map((c) => (
                <option key={c.carId} value={c.carId}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filterPlanId ?? ""}
              onChange={(e) => setFilterPlanId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border px-3 py-2 rounded-md"
            >
              <option value="">Tất cả gói</option>
              {plans.map((p) => (
                <option key={p.planId} value={p.planId}>
                  {p.carName} - {p.durationType}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full h-80 flex justify-center items-center">
          {loadingRevenue ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue"
                      ? `${(value as number).toLocaleString()} đ`
                      : value
                  }
                  labelFormatter={(label) => `Ngày/Tháng/Năm: ${label}`}
                />
                <Bar dataKey="revenue" fill="#2563eb" name="Doanh thu" />
                <Bar dataKey="bookings" fill="#f59e0b" name="Số lượt đặt" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TOP CARS & TOP PLANS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TopList title="Top xe được thuê nhiều" items={topCars} type="car" />
        <TopList title="Top gói thuê phổ biến" items={topPlans} type="plan" />
      </div>
    </div>
  );
}

// ----- TopList Component -----
type TopListProps = {
  title: string;
  items: TopCar[] | TopPlan[];
  type: "car" | "plan";
};

const TopList = ({ title, items, type }: TopListProps) => (
  <div className="bg-white shadow-md p-6 rounded-xl border">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition"
        >
          <p className="font-medium">
            {type === "car" ? (item as TopCar).carName : (item as TopPlan).plan}
          </p>
          <p className="text-sm text-gray-500">
            Số lượt thuê:{" "}
            <b>{type === "car" ? (item as TopCar).bookedCount : (item as TopPlan).count}</b>
          </p>
        </li>
      ))}
    </ul>
  </div>
);
