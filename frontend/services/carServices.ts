import api from "./api";
export const getAllCar = async () => {
    const res = await api.get("/api/cars/All");
    return res.data;
};

export const getCarById = async (carId: number) => {
    const res = await api.get(`/api/cars/${carId}`);
    return res.data;
};

export const getCarsByCategory = async (categoryName: string) => {
    const res = await api.get(`/api/cars/get-by-carCategoryName`, {
        params: {carCategoryName: categoryName}
    });
    return res.data;
};

export const getCarByRentalPlan = async (durationType: string) => {
    const res = await api.get(`/api/cars/get-by-rentalPlan`, {
        params: { durationType }
    });
    return res.data;
};

export const createCar = async (data: any) => {
    const res = await api.post("/api/cars", data);
    return res.data;
};

export const updateCar = async (carId: number, data: any) => {
    const res = await api.put(`/api/cars/${carId}`, data);
    return res.data;
};

export const uploadCarImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url;
};

export const deleteCar = async (carId: number) => {
    const res = await api.delete(`/api/cars/${carId}`);
    return res.data;
};