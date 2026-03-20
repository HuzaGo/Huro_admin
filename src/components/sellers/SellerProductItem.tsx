import Image from "next/image";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SellerProduct } from "@/store/slices/sellerSlice";

interface Props {
  item: SellerProduct;
}

export function SellerProductItem({ item }: Props) {
  const stockStatus = !item.isAvailable
    ? { label: "UNAVAILABLE", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" }
    : item.stockQuantity === 0
    ? { label: "SOLD OUT", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" }
    : item.stockQuantity <= 5
    ? { label: "LOW", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" }
    : { label: "IN STOCK", className: "bg-green-100 text-green-700 hover:bg-green-100" };

  const displayName = item.customName || item.product.name;
  const price = `${item.price.toLocaleString()} RWF`;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
          {item.product.imageUrl ? (
            <Image
              src={item.product.imageUrl}
              alt={displayName}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <Package className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 line-clamp-1">{displayName}</p>
          <p className="text-xs text-blue-600 font-semibold">{price}</p>
        </div>
      </div>
      <Badge variant="secondary" className={`text-[10px] font-semibold tracking-wider ${stockStatus.className}`}>
        {stockStatus.label}
      </Badge>
    </div>
  );
}
