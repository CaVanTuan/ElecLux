import api from "./api";

export const getAllCategory = async () => {
    const res = await api.get("/api/carCategories/All");
    return res.data;
};

export const getCategoryById = async (categoryId: number) => {
    const res = await api.get(`/api/carCategories/${categoryId}`);
    return res.data;
};

export const getCategoryByName = async (categoryName: string) => {
    const res = await api.get(`/api/carCategories/carCategoryName`, {
        params: { carCategoryName: categoryName }
    });
    return res.data;
};

export const createCategory = async (data: any) => {
    const res = await api.post("/api/carCategories", data);
    return res.data;
};

export const updateCategory = async (categoryId: number, data: any) => {
    const res = await api.put(`/api/carCategories/${categoryId}`, data);
    return res.data;
};

export const deleteCategory = async (categoryId: number) => {
    const res = await api.delete(`/api/carCategories/${categoryId}`);
    return res.data;
};
