"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSellers, fetchSellerProducts, clearSellerMessages } from "@/store/slices/sellerSlice";
import { SellersTable } from "@/components/sellers/SellersTable";
import { SellerDetailPanel } from "@/components/sellers/SellerDetailPanel";
import { AddSellerSheet } from "@/components/sellers/AddSellerSheet";

export default function SellersPage() {
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { sellers, isFetching, sellerProducts, isFetchingProducts, productsError } =
    useAppSelector((s) => s.sellers);

  useEffect(() => {
    dispatch(fetchSellers({ page: 1, limit: 20 }));
    return () => { dispatch(clearSellerMessages()); };
  }, [dispatch]);

  useEffect(() => {
    if (selectedSellerId) dispatch(fetchSellerProducts({ sellerId: selectedSellerId }));
  }, [selectedSellerId, dispatch]);

  const selectedSeller = sellers.find((s) => s.id === selectedSellerId);

  const handleSelect = (id: string) =>
    setSelectedSellerId((prev) => (prev === id ? null : id));

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      <div className="flex-1 flex flex-col">
        <div className="p-6 flex-1 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sellers Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and monitor all platform vendors and their performance.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search sellers, products, or locations..." className="pl-9 bg-white" />
              </div>
              <Button onClick={() => setIsSheetOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Seller
              </Button>
            </div>
          </div>

          <SellersTable
            sellers={sellers}
            isFetching={isFetching}
            selectedSellerId={selectedSellerId}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {selectedSellerId && selectedSeller && (
        <SellerDetailPanel
          seller={selectedSeller}
          products={sellerProducts}
          isFetchingProducts={isFetchingProducts}
          productsError={productsError}
          onClose={() => setSelectedSellerId(null)}
        />
      )}

      <AddSellerSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
