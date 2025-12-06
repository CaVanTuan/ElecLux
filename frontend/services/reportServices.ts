import api from "./api";

export const getRevenue = async (params: {
  carId?: number;
  planId?: number;
  groupBy?: string;
}) => {
  const res = await api.get("/api/reports/revenue", { params });
  return res.data;
};

export const getTopPlans = async (top: number = 5) => {
  const res = await api.get("/api/reports/top-plans", {
    params: { top }
  });
  return res.data;
};

export const getBookingStats = async (params: {
  carId?: number;
  planId?: number;
}) => {
  const res = await api.get("/api/reports/bookings", { params });
  return res.data;
};

export const getTopCars = async (top: number = 5) => {
  const res = await api.get("/api/reports/top-cars", {
    params: { top }
  });
  return res.data;
};

export const getSummary = async () => {
  const res = await api.get("/api/reports/summary");
  return res.data;
};
