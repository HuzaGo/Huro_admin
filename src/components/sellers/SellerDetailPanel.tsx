import Image from "next/image";
import { useState } from "react";
import { Plus, Store, X, MapPin, ExternalLink, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SellerProductItem } from "@/components/sellers/SellerProductItem";
import { AssignProductSheet } from "@/components/sellers/AssignProductSheet";
import { EditSellerSheet } from "@/components/sellers/EditSellerSheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteSeller,
  updateSellerProduct,
  unassignSellerProduct,
} from "@/store/slices/sellerSlice";
import type { Seller, SellerProduct } from "@/store/slices/sellerSlice";

interface Props {
  seller: Seller;
  products: SellerProduct[];
  isFetchingProducts: boolean;
  productsError: string | null;
  onClose: () => void;
}

interface EditForm {
  price: string;
  stockQuantity: string;
  isAvailable: boolean;
}

export function SellerDetailPanel({ seller, products, isFetchingProducts, productsError, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { isDeleting, deleteError, isUpdatingProduct, updateProductError, isUnassigning, unassignError } =
    useAppSelector((s) => s.sellers);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Product edit state
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ price: "", stockQuantity: "", isAvailable: true });

  // Product delete confirm
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const handleDelete = async () => {
    const result = await dispatch(deleteSeller(seller.id));
    if (deleteSeller.fulfilled.match(result)) onClose();
  };

  const openEditProduct = (item: SellerProduct) => {
    setEditingProduct(item);
    setEditForm({
      price: String(item.price),
      stockQuantity: String(item.stockQuantity),
      isAvailable: item.isAvailable,
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    const result = await dispatch(
      updateSellerProduct({
        sellerId: seller.id,
        spId: editingProduct.id,
        price: Number(editForm.price),
        stockQuantity: Number(editForm.stockQuantity),
        isAvailable: editForm.isAvailable,
      })
    );
    if (updateSellerProduct.fulfilled.match(result)) setEditingProduct(null);
  };

  const handleUnassign = async (spId: string) => {
    const result = await dispatch(unassignSellerProduct({ sellerId: seller.id, spId }));
    if (unassignSellerProduct.fulfilled.match(result)) setDeletingProductId(null);
  };

  return (
    <div className="w-100 border-l border-gray-200 bg-white shadow-xl flex flex-col animate-in slide-in-from-right-8 fade-in duration-300 z-10">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Seller Details</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-100" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-20 w-20 rounded-xl mb-4 overflow-hidden bg-blue-50 flex items-center justify-center">
            {seller.logoUrl ? (
              <Image src={seller.logoUrl} alt={seller.name} fill className="object-cover" />
            ) : (
              <Store className="h-10 w-10 text-blue-500" />
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{seller.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{seller.description}</p>
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Location
          </span>
          <span className="font-medium text-blue-600">{seller.pickupLocationName || "N/A"}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-col">
          <div className="flex gap-2">
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setIsAssignOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
          </div>

          {!confirmDelete ? (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Seller
            </Button>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-sm text-red-700 font-medium text-center">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-gray-600 border-gray-200"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </div>
          )}

          {deleteError && <p className="text-sm text-red-500 text-center">{deleteError}</p>}
        </div>

        <Separator className="bg-gray-100" />

        {/* Product Inventory */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Product Inventory</h4>

          {isFetchingProducts ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : productsError ? (
            <p className="text-sm text-red-500 text-center">{productsError}</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No products found for this seller.</p>
          ) : (
            <div className="space-y-3">
              {products.map((item) => (
                <div key={item.id}>
                  {/* Edit inline form */}
                  {editingProduct?.id === item.id ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                        Editing: {item.customName || item.product.name}
                      </p>

                      {updateProductError && (
                        <p className="text-xs text-red-500">{updateProductError}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Price (RWF)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={editForm.price}
                            onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                            disabled={isUpdatingProduct}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Stock</Label>
                          <Input
                            type="number"
                            min="0"
                            value={editForm.stockQuantity}
                            onChange={(e) => setEditForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                            disabled={isUpdatingProduct}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
                          disabled={isUpdatingProduct}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                            editForm.isAvailable ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              editForm.isAvailable ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <Label className="text-xs">
                          {editForm.isAvailable ? "Available" : "Unavailable"}
                        </Label>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => setEditingProduct(null)}
                          disabled={isUpdatingProduct}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleUpdateProduct}
                          disabled={isUpdatingProduct}
                        >
                          {isUpdatingProduct ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : deletingProductId === item.id ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                      <p className="text-xs text-red-700 font-medium text-center">
                        Remove <span className="font-bold">{item.customName || item.product.name}</span> from this seller?
                      </p>
                      {unassignError && <p className="text-xs text-red-500 text-center">{unassignError}</p>}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => setDeletingProductId(null)}
                          disabled={isUnassigning}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleUnassign(item.id)}
                          disabled={isUnassigning}
                        >
                          {isUnassigning ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <SellerProductItem
                      item={item}
                      onEdit={openEditProduct}
                      onDelete={(p) => setDeletingProductId(p.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AssignProductSheet
        sellerId={seller.id}
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
      />

      <EditSellerSheet
        seller={seller}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
        <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium">
          <ExternalLink className="h-4 w-4 mr-2" /> View Full Merchant Profile
        </Button>
      </div>
    </div>
  );
}
