// app/car/[id]/page.tsx
import { getCarById } from "@/services/carServices";
import CarDetailClient from "./client";

interface Props {
  params: any;
}

export default async function CarDetailPage({ params }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const idStr = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;
  const carId = parseInt(idStr, 10);

  if (isNaN(carId) || carId <= 0) {
    return <p className="text-center text-red-500">ID xe không hợp lệ 😢</p>;
  }

  let car;
  try {
    car = await getCarById(carId);
  } catch (err) {
    console.error(err);
    return <p className="text-center text-red-500">Không tìm thấy xe hoặc xảy ra lỗi 😢</p>;
  }

  if (!car) {
    return <p className="text-center text-red-500">Không tìm thấy xe 😢</p>;
  }

  return <CarDetailClient car={car} />;
}
