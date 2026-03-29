"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { assignProductToSeller, fetchSellerProducts } from "@/store/slices/sellerSlice";
import { fetchProducts } from "@/store/slices/productSlice";

interface Props {
  sellerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = { price: "", stockQuantity: "", rank: "", customName: "", customDescription: "" };

export function AssignProductSheet({ sellerId, open, onOpenChange }: Props) {
  const dispatch = useAppDispatch();
  const { isAssigning, assignError } = useAppSelector((s) => s.sellers);
  const { products, isFetching } = useAppSelector((s) => s.products);

  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const set = (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (open) dispatch(fetchProducts({ page: 1, limit: 100 }));
    else {
      setTimeout(() => {
        setSearch("");
        setSelectedProductId(null);
        setForm(emptyForm);
      }, 300);
    }
  }, [open, dispatch]);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const result = await dispatch(assignProductToSeller({
      sellerId,
      productId: selectedProductId,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity, 10),
      ...(form.rank && { rank: parseInt(form.rank, 10) }),
      ...(form.customName && { customName: form.customName }),
      ...(form.customDescription && { customDescription: form.customDescription }),
    }));

    if (assignProductToSeller.fulfilled.match(result)) {
      dispatch(fetchSellerProducts({ sellerId }));
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md px-6" side="right">
        <SheetHeader>
          <SheetTitle>Assign Product</SheetTitle>
          <SheetDescription>
            Select a product and set custom pricing and stock for this seller.
          </SheetDescription>
        </SheetHeader>

        {assignError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-4">{assignError}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 pb-10">
          {/* Product Search & Select */}
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {isFetching ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No products found.</p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProductId(p.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-gray-50 last:border-0 ${
                      selectedProductId === p.id
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {p.name}
                  </button>
                ))
              )}
            </div>

            {selectedProduct && (
              <p className="text-xs text-blue-600 font-medium">
                Selected: {selectedProduct.name}
              </p>
            )}
          </div>

          {/* Price & Stock */}
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="price">Price (RWF)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={set("price")}
                required
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                placeholder="0"
                value={form.stockQuantity}
                onChange={set("stockQuantity")}
                required
              />
            </div>
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <Label htmlFor="rank">Rank <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input
              id="rank"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={form.rank}
              onChange={set("rank")}
            />
          </div>

          {/* Optional overrides */}
          <div className="space-y-2">
            <Label htmlFor="customName">Custom Name <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input
              id="customName"
              placeholder="Override product name for this seller"
              value={form.customName}
              onChange={set("customName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customDescription">Custom Description <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input
              id="customDescription"
              placeholder="Override description for this seller"
              value={form.customDescription}
              onChange={set("customDescription")}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
            disabled={isAssigning || !selectedProductId}
          >
            {isAssigning ? "Assigning..." : "Assign Product"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
