"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getCarById } from "@/services/carServices";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";
import Feedback from "@/components/feedBack";

export default function CarDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const planQuery = searchParams.get("plan");

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  // Lấy currentUserId từ localStorage
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  useEffect(() => {
    const idStr = localStorage.getItem("currentUserId");
    if (idStr) setCurrentUserId(Number(idStr));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchCar = async () => {
      try {
        const data = await getCarById(Number(id));
        setCar(data);

        if (data?.rentalPlans?.length > 0) {
          if (planQuery) {
            const plan = data.rentalPlans.find((p: any) => p.durationType === planQuery);
            setSelectedPlan(plan || data.rentalPlans[0]);
          } else {
            setSelectedPlan(data.rentalPlans[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi tải thông tin xe:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCar();
  }, [id, planQuery]);

  if (loading)
    return <div className="p-4 text-center text-gray-500">Đang tải dữ liệu xe...</div>;
  if (!car)
    return <div className="p-4 text-center text-red-500">Không tìm thấy xe!</div>;

  const openLightbox = (url: string) => {
    setLightboxImage(url);
    setLightboxOpen(true);
  };

  const closeLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxOpen(false);
    setLightboxImage("");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Tên xe */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-800">{car.name}</h1>

      {/* Ảnh chính */}
      {car.imageUrl && (
        <div className="relative mb-4 cursor-pointer" onClick={() => openLightbox(car.imageUrl)}>
          <div className="w-full h-64 md:h-96 relative rounded-xl overflow-hidden border shadow-md">
            <Image src={car.imageUrl} alt={car.name} fill className="object-cover" />
          </div>
        </div>
      )}

      {/* Giá + Nút đặt xe */}
      {selectedPlan && (
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-white border rounded-lg p-4 shadow-md">
          <div className="flex items-center text-center mb-3 md:mb-0">
            <div className="text-gray-700">Chỉ từ</div>
            <div className="font-black text-2xl mx-2 text-[#00D287]">
              {selectedPlan.price?.toLocaleString("vi-VN") || "Đang cập nhật"}
            </div>
            <div className="font-semibold text-md text-gray-700 translate-y-1/4">
              VNĐ/{selectedPlan.durationType}
            </div>
          </div>

          <Link
            href={`/checkout?carId=${car.carId}&plan=${selectedPlan?.durationType}`}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Đặt xe ngay
          </Link>
        </div>
      )}

      {/* Combo box chọn gói thuê */}
      {car.rentalPlans?.length > 0 && (
        <div className="mb-4">
          <label htmlFor="planSelect" className="font-semibold mr-2">Chọn gói thuê:</label>
          <select
            id="planSelect"
            value={selectedPlan?.durationType || ""}
            onChange={(e) => {
              const plan = car.rentalPlans.find((p: any) => p.durationType === e.target.value);
              setSelectedPlan(plan || car.rentalPlans[0]);
            }}
            className="border rounded px-3 py-2"
          >
            {car.rentalPlans.map((plan: any) => (
              <option key={plan.durationType} value={plan.durationType}>
                {plan.durationType} - {plan.price?.toLocaleString("vi-VN") || "Đang cập nhật"} VNĐ
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Gallery */}
      {car.carImages?.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Hình ảnh</h2>
          <div className="flex gap-3 overflow-x-auto py-2 mb-6">
            {car.carImages.map((img: any) => (
              <div
                key={img.imageId}
                className="relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden border shadow-sm cursor-pointer"
                onClick={() => openLightbox(img.url)}
              >
                <Image src={img.url} alt={`image-${img.imageId}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Thông số kỹ thuật + Điều kiện thuê */}
      <div className="flex flex-col border border-[#4b9c6b] px-4 gap-4 pt-4 pb-4 rounded-lg mb-6">
        <div className="text-center font-extrabold text-2xl text-[#111827]">{car.name}</div>

        <div className="grid grid-cols-2 gap-y-3">
          {car.specifications?.map((spec: any) => (
            <div key={spec.specId} className="flex items-center gap-2">
              <span className="font-semibold w-32">{spec.key}:</span>
              <span>{spec.value}</span>
            </div>
          ))}

          <hr className="col-span-2 border-[#d9e1e2]" />

          {/* Điều kiện thuê */}
          <div className="col-span-2">
            <div className="font-semibold mb-2">Thông tin cần có khi nhận xe</div>
            <ul className="list-disc list-inside space-y-1">
              <li>CCCD hoặc Hộ chiếu còn thời hạn</li>
              <li>Bằng lái hợp lệ, còn thời hạn</li>
            </ul>

            <div className="font-semibold mt-3 mb-2">Hình thức thanh toán</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Trả trước</li>
              <li>Thời hạn thanh toán: đặt cọc giữ xe, thanh toán 100% khi ký hợp đồng và nhận xe</li>
            </ul>

            <div className="font-semibold mt-3 mb-2">Chính sách đặt cọc (thế chân)</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Khách hàng phải thanh toán số tiền cọc là 5.000.000đ</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feedback component - luôn hiển thị */}
      <div className="mt-8">
        <Feedback carId={car.carId} currentUserId={currentUserId || 0} />
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-1 hover:bg-gray-700 transition"
              onClick={closeLightbox}
            >
              <X size={24} />
            </button>
            <Image
              src={lightboxImage}
              alt="Phóng to"
              width={1200}
              height={800}
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
