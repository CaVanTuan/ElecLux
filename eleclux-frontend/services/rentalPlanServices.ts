import api from "./api";

const rentalPlanService = {
  // Lấy tất cả gói thuê
  getAll: async () => {
    const res = await api.get("/api/rentalPlans/All");
    return res.data;
  },

  // Lấy gói thuê theo CarId
  getByCarId: async (carId: number) => {
    const res = await api.get(`/api/rentalPlans/${carId}`);
    return res.data;
  },

  // Lấy gói thuê theo tên xe
  getByCarName: async (carName: string) => {
    const res = await api.get(`/api/rentalPlans/carName`, {
      params: { carName }
    });
    return res.data;
  },

  // Lấy gói thuê theo loại thời gian (theo durationType)
  getByDurationType: async (durationType: string) => {
    const res = await api.get(`/api/rentalPlans/durationType`, {
      params: { durationType }
    });
    return res.data;
  },

  // Thêm mới gói thuê cho xe
  create: async (carId: number, rentalPlanData: any) => {
    const res = await api.post(`/api/rentalPlans/${carId}`, rentalPlanData);
    return res.data;
  },

  // Cập nhật gói thuê (chỉ admin)
  update: async (rentalPlanId: number, rentalPlanData: any) => {
    const res = await api.put(`/api/rentalPlans/${rentalPlanId}`, rentalPlanData);
    return res.data;
  },

  // Xoá gói thuê (chỉ admin)
  delete: async (rentalPlanId: number) => {
    const res = await api.delete(`/api/rentalPlans/${rentalPlanId}`);
    return res.data;
  }
};

export default rentalPlanService;
