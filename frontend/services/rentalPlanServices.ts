import api from "./api";

// Lấy tất cả gói thuê
export const getAllRentalPlans = async () => {
  const res = await api.get("/api/rentalPlans/All");
  return res.data;
};

// Lấy gói thuê theo CarId
export const getRentalPlansByCarId = async (carId: number) => {
  const res = await api.get("/api/rentalPlans", { params: { carId } });
  return res.data;
};

// Lấy gói thuê theo tên xe
export const getRentalPlansByCarName = async (carName: string) => {
  const res = await api.get("/api/rentalPlans", { params: { carName } });
  return res.data;
};

// Lấy gói thuê theo DurationType
export const getRentalPlansByDurationType = async (durationType: string) => {
  const res = await api.get("/api/rentalPlans", { params: { durationType } });
  return res.data;
};

// Thêm mới gói thuê cho xe
export const createRentalPlan = async (carId: number, rentalPlanData: any) => {
  const res = await api.post(`/api/rentalPlans/${carId}`, rentalPlanData);
  return res.data;
};

// Cập nhật gói thuê (chỉ admin)
export const updateRentalPlan = async (rentalPlanId: number, rentalPlanData: any) => {
  const res = await api.put(`/api/rentalPlans/${rentalPlanId}`, rentalPlanData);
  return res.data;
};

// Xoá gói thuê (chỉ admin)
export const deleteRentalPlan = async (rentalPlanId: number) => {
  const res = await api.delete(`/api/rentalPlans/${rentalPlanId}`);
  return res.data;
};
