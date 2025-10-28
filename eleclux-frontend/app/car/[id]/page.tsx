// app/car/[id]/page.tsx
import { getCarById } from "@/services/carServices";
import { use } from "react"; // dùng để unwrap params Promise

interface Props {
  params: { id: string };
}

export default async function CarDetailPage({ params }: Props) {
  // Unwrap params.id
  const id = await use(params).id;
  const carId = Number(id);

  if (isNaN(carId)) return <p>ID xe không hợp lệ</p>;

  // Fetch dữ liệu server-side trực tiếp
  let car;
  try {
    car = await getCarById(carId);
  } catch {
    return <p>Không tìm thấy xe hoặc xảy ra lỗi</p>;
  }

  if (!car) return <p>Không tìm thấy xe</p>;

  const rentalPlans = car.RentalPlans ?? [];
  const specifications = car.Specifications ?? [];
  const carImages = car.CarImages ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{car.Name}</h1>

      <img
        src={car.ImageUrl || "/default-car.jpg"}
        alt={car.Name}
        className="w-full h-64 object-cover rounded-lg mb-4"
      />

      <p className="text-gray-500 mb-4">
        Loại: {car.Category?.Name || "Không có danh mục"}
      </p>

      <h2 className="text-2xl font-semibold mb-2">Gói thuê</h2>
      {rentalPlans.length > 0 ? (
        <ul className="text-gray-700">
          {rentalPlans.map((plan: any) => (
            <li key={plan.PlanId} className="mb-1">
              ⏱ {plan.DurationType}: 💰 {plan.Price.toLocaleString()} VNĐ
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 italic">Chưa có gói thuê</p>
      )}

      {specifications.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-4">Thông số kỹ thuật</h2>
          <ul>
            {specifications.map((spec: any, idx: number) => (
              <li key={spec.Id ?? idx}>
                {spec.Key}: {spec.Value}
              </li>
            ))}
          </ul>
        </>
      )}

      {carImages.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-4">Hình ảnh xe</h2>
          <div className="grid grid-cols-2 gap-2">
            {carImages.map((img: any, idx: number) => (
              <img
                key={img.Id ?? idx}
                src={img.Url}
                alt={car.Name}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}