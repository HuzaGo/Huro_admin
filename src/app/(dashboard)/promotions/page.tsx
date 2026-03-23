"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActivePromotions,
  createPromotion,
  clearPromotionMessages,
  PromotionScope,
  DiscountType,
} from "@/store/slices/promotionSlice";
import { fetchCategories } from "@/store/slices/categorySlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyForm = {
  title: "",
  scope: "CART_WIDE" as PromotionScope,
  categoryId: "",
  selectedProductIds: [] as string[],
  discountType: "PERCENTAGE" as DiscountType,
  discountValue: 0,
  minCartValue: 0,
  startsAt: "",
  endsAt: "",
};

export default function PromotionsPage() {
  const dispatch = useAppDispatch();
  const {
    activePromotionsList,
    isFetchingActive,
    activeError,
    totalActive,
    currentPageActive,
    totalPagesActive,
    isCreating,
    createError,
    createSuccess,
  } = useAppSelector((s) => s.promotions);
  const { categories } = useAppSelector((s) => s.categories);
  const { products } = useAppSelector((s) => s.products);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    dispatch(fetchActivePromotions({ page: currentPageActive, limit: 20 }));
  }, [dispatch, currentPageActive]);

  // Load categories and products when the sheet opens
  useEffect(() => {
    if (isSheetOpen) {
      if (categories.length === 0) dispatch(fetchCategories());
      if (products.length === 0) dispatch(fetchProducts({ limit: 100 }));
    }
  }, [isSheetOpen, dispatch, categories.length, products.length]);

  useEffect(() => {
    if (!isSheetOpen) {
      setTimeout(() => {
        setForm(emptyForm);
        setProductSearch("");
        dispatch(clearPromotionMessages());
      }, 300);
    }
  }, [isSheetOpen, dispatch]);

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      selectedProductIds: f.selectedProductIds.includes(id)
        ? f.selectedProductIds.filter((p) => p !== id)
        : [...f.selectedProductIds, id],
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const startsAt = form.startsAt ? new Date(form.startsAt) : null;
    const endsAt = form.endsAt ? new Date(form.endsAt) : null;

    if (!startsAt || isNaN(startsAt.getTime())) return;
    if (!endsAt || isNaN(endsAt.getTime())) return;
    if (endsAt <= startsAt) return;

    const result = await dispatch(
      createPromotion({
        title: form.title.trim(),
        scope: form.scope,
        categoryId: form.scope === "CATEGORY" ? form.categoryId : null,
        productIds: form.scope === "PRODUCT" ? form.selectedProductIds : null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minCartValue: Number(form.minCartValue),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      })
    );

    if (createPromotion.fulfilled.match(result)) {
      setIsSheetOpen(false);
    }
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  const scopeColor: Record<PromotionScope, string> = {
    CART_WIDE: "bg-blue-50 text-blue-600",
    CATEGORY: "bg-purple-50 text-purple-600",
    PRODUCT: "bg-orange-50 text-orange-600",
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProductNames = form.selectedProductIds
    .map((id) => products.find((p) => p.id === id)?.name ?? id)
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount promotions.</p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Promotion
        </Button>
      </div>

      {activeError && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {activeError}
        </div>
      )}

      {isFetchingActive ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : activePromotionsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Tag className="h-10 w-10" />
          <p className="text-sm">No active promotions found.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Title</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Cart</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Ends</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePromotionsList.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={scopeColor[promo.scope] ?? ""}
                      >
                        {promo.scope}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promo.discountValue}
                      {promo.discountType === "PERCENTAGE" ? "%" : " (fixed)"}
                    </TableCell>
                    <TableCell>{promo.minCartValue}</TableCell>
                    <TableCell>{formatDate(promo.startsAt)}</TableCell>
                    <TableCell>{formatDate(promo.endsAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPagesActive > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{totalActive} active promotion{totalActive !== 1 ? "s" : ""}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPageActive <= 1}
                  onClick={() =>
                    dispatch(fetchActivePromotions({ page: currentPageActive - 1, limit: 20 }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>{currentPageActive} / {totalPagesActive}</span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPageActive >= totalPagesActive}
                  onClick={() =>
                    dispatch(fetchActivePromotions({ page: currentPageActive + 1, limit: 20 }))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto px-6 py-8">
          <SheetHeader>
            <SheetTitle>New Promotion</SheetTitle>
            <SheetDescription>Fill in the details to create a promotion.</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {createError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {createSuccess}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="promo-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="promo-title"
                placeholder="e.g. Summer Sale"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                disabled={isCreating}
              />
            </div>

            {/* Scope */}
            <div className="space-y-2">
              <Label>
                Scope <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.scope}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    scope: v as PromotionScope,
                    categoryId: "",
                    selectedProductIds: [],
                  }))
                }
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CART_WIDE">Cart Wide — applies to entire cart</SelectItem>
                  <SelectItem value="CATEGORY">Category — applies to a category</SelectItem>
                  <SelectItem value="PRODUCT">Product — applies to specific products</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category picker */}
            {form.scope === "CATEGORY" && (
              <div className="space-y-2">
                <Label>
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? "" }))}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Product multi-picker */}
            {form.scope === "PRODUCT" && (
              <div className="space-y-2">
                <Label>
                  Products <span className="text-red-500">*</span>
                </Label>

                {/* Selected product badges */}
                {selectedProductNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.selectedProductIds.map((id) => {
                      const name = products.find((p) => p.id === id)?.name ?? id;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => toggleProduct(id)}
                            className="hover:text-blue-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Search products…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 text-sm"
                    disabled={isCreating}
                  />
                </div>

                {/* Scrollable product list */}
                <div className="border border-gray-100 rounded-lg overflow-y-auto max-h-48">
                  {filteredProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No products found.</p>
                  ) : (
                    filteredProducts.map((product) => {
                      const selected = form.selectedProductIds.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          disabled={isCreating}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                            selected ? "bg-blue-50" : ""
                          }`}
                        >
                          <span
                            className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                              selected
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {selected && (
                              <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white fill-current">
                                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className="truncate font-medium text-gray-800">{product.name}</span>
                          <span className="ml-auto text-xs text-gray-400 shrink-0">
                            {product.price} RWF
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
                {form.selectedProductIds.length === 0 && (
                  <p className="text-xs text-gray-400">Select at least one product.</p>
                )}
              </div>
            )}

            {/* Discount Type */}
            <div className="space-y-2">
              <Label>
                Discount Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.discountType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, discountType: v as DiscountType }))
                }
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Value + Min Cart */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="promo-discount-val">
                  {form.discountType === "PERCENTAGE" ? "Discount %" : "Discount Amount"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="promo-discount-val"
                  type="number"
                  min="0"
                  max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                  step="any"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))
                  }
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-min-cart">Min Cart Value</Label>
                <Input
                  id="promo-min-cart"
                  type="number"
                  min="0"
                  step="any"
                  value={form.minCartValue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minCartValue: Number(e.target.value) }))
                  }
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="promo-starts">
                  Starts At <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="promo-starts"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-ends">
                  Ends At <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="promo-ends"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                  required
                  disabled={isCreating}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={
                isCreating ||
                !form.title.trim() ||
                (form.scope === "CATEGORY" && !form.categoryId) ||
                (form.scope === "PRODUCT" && form.selectedProductIds.length === 0)
              }
            >
              {isCreating ? "Creating..." : "Create Promotion"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
