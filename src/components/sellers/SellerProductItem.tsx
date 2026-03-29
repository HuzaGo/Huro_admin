import Image from "next/image";
import { Package, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SellerProduct } from "@/store/slices/sellerSlice";

interface Props {
  item: SellerProduct;
  onEdit?: (item: SellerProduct) => void;
  onDelete?: (item: SellerProduct) => void;
}

export function SellerProductItem({ item, onEdit, onDelete }: Props) {
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
      <div className="flex items-center gap-3 min-w-0">
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
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
          <p className="text-xs text-blue-600 font-semibold">{price}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <Badge variant="secondary" className={`text-[10px] font-semibold tracking-wider ${stockStatus.className}`}>
          {stockStatus.label}
        </Badge>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => onEdit(item)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
