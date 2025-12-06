"use client";

import { useState, useEffect, FormEvent } from "react";
import { getCarById, updateCar, uploadCarImage } from "@/services/carServices";
import { getAllCategory } from "@/services/categoryServices";
import { useRouter, useParams } from "next/navigation";

interface CarCategory {
  categoryId: number;
  name: string;
}

export default function EditCarPage() {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [seats, setSeats] = useState(4);
  const [rangeKm, setRangeKm] = useState(100);
  const [imageUrl, setImageUrl] = useState(""); // ảnh đại diện
  const [carImages, setCarImages] = useState<string[]>([]); // ảnh thêm
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CarCategory[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Load category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategory();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Load car data
  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      try {
        const data = await getCarById(Number(id));
        setName(data.name);
        setType(data.type);
        setSeats(data.seats);
        setRangeKm(data.rangeKm);
        setImageUrl(data.imageUrl);
        setCarImages(data.carImages?.map((img: any) => img.url) || []);
        setCategoryId(data.categoryId);
        setSpecs(data.specifications?.map((s: any) => ({ key: s.key, value: s.value })) || []);
      } catch (err) {
        console.error(err);
        alert("Không tải được thông tin xe!");
      }
    };
    fetchCar();
  }, [id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setLoading(true);
      const url = await uploadCarImage(file);
      setImageUrl(url);
    } catch (err) {
      console.error("Upload ảnh đại diện thất bại", err);
      alert("Upload ảnh đại diện thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCarImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const urls: string[] = [];
    setLoading(true);
    for (const file of files) {
      try {
        const url = await uploadCarImage(file);
        urls.push(url);
      } catch (err) {
        console.error("Upload ảnh thêm thất bại", err);
      }
    }
    setCarImages(prev => [...prev, ...urls]);
    setLoading(false);
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleRemoveCarImage = (url: string) => {
    setCarImages(carImages.filter(u => u !== url));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId) return alert("Chọn danh mục xe!");
    if (!imageUrl) return alert("Chọn ảnh đại diện!");

    const data = {
      name,
      type,
      seats,
      rangeKm,
      imageUrl,
      categoryId,
      specification: specs.filter(s => s.key && s.value),
      images: carImages.map(url => ({ url })),
    };

    try {
      setLoading(true);
      await updateCar(Number(id), data);
      alert("Cập nhật xe thành công!");
      router.push("/admin/cars");
    } catch (err) {
      console.error(err);
      alert("Cập nhật xe thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center justify-between">
        Chỉnh Sửa Xe
        <button
          type="button"
          onClick={() => router.push("/admin/cars")}
          className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
        >
          Quay về
        </button>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Tên Xe:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Loại Xe:</label>
          <input
            type="text"
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block mb-1">Số Ghế:</label>
            <input
              type="number"
              value={seats}
              onChange={e => setSeats(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
              min={1}
            />
          </div>
          <div>
            <label className="block mb-1">Quãng Đường (km):</label>
            <input
              type="number"
              value={rangeKm}
              onChange={e => setRangeKm(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
              min={1}
            />
          </div>
        </div>
        <div>
          <label className="block mb-1">Danh Mục:</label>
          <select
            value={categoryId || undefined}
            onChange={e => setCategoryId(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            {categories.map(c => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ảnh đại diện */}
        <div>
          <label className="block mb-1">Ảnh Đại Diện:</label>
          <input type="file" onChange={handleImageChange} className="mb-2" />
          {imageUrl && (
            <img src={imageUrl} alt="Ảnh đại diện" className="w-40 h-40 object-cover rounded mt-2" />
          )}
        </div>

        {/* Ảnh thêm */}
        <div>
          <label className="block mb-1">Ảnh Thêm:</label>
          <input type="file" multiple onChange={handleCarImagesChange} className="mb-2" />
          <div className="flex gap-2 flex-wrap">
            {carImages.map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} alt="Car" className="w-32 h-32 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveCarImage(url)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Specs */}
        <div>
          <label className="block mb-1">Thông số (Specs):</label>
          {specs.map((spec, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Key"
                value={spec.key}
                onChange={e => handleSpecChange(idx, "key", e.target.value)}
                className="border px-2 py-1 rounded flex-1"
              />
              <input
                type="text"
                placeholder="Value"
                value={spec.value}
                onChange={e => handleSpecChange(idx, "value", e.target.value)}
                className="border px-2 py-1 rounded flex-1"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSpec}
            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            Thêm thông số
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật Xe"}
        </button>
      </form>
    </div>
  );
}
