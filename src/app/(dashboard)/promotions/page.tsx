"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, X, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActivePromotions,
  createPromotion,
  clearPromotionMessages,
  PromotionScope,
  PromotionType,
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
  description: "",
  type: "DISCOUNT" as PromotionType,
  scope: "CART_WIDE" as PromotionScope,
  categoryId: "",
  selectedProductIds: [] as string[],
  discountType: "PERCENTAGE" as DiscountType,
  discountValue: 0,
  minCartValue: 0,
  minQuantity: "" as string,
  freeQuantity: "" as string,
  startsAt: "",
  endsAt: "",
};

const TYPE_COLORS: Record<PromotionType, string> = {
  DISCOUNT:      "bg-blue-50 text-blue-700",
  ADDITIONAL:    "bg-purple-50 text-purple-700",
  FREE_DELIVERY: "bg-green-50 text-green-700",
  CASHBACK:      "bg-yellow-50 text-yellow-700",
  FLASH_SALE:    "bg-red-50 text-red-700",
};

const SCOPE_COLORS: Record<PromotionScope, string> = {
  CART_WIDE: "bg-blue-50 text-blue-600",
  CATEGORY:  "bg-purple-50 text-purple-600",
  SPECIFIC:  "bg-orange-50 text-orange-600",
  BUNDLE:    "bg-teal-50 text-teal-600",
  PRODUCT:   "bg-orange-50 text-orange-600",
};

// Scopes that require product selection
const PRODUCT_SCOPES: PromotionScope[] = ["SPECIFIC", "BUNDLE", "PRODUCT"];

export default function PromotionsPage() {
  const dispatch = useAppDispatch();
  const {
    activePromotionsList,
    isFetchingActive,
    activeError,
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
    dispatch(fetchActivePromotions());
  }, [dispatch]);

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

    const isProductScope = PRODUCT_SCOPES.includes(form.scope);
    const isBXGY = form.type === "ADDITIONAL";

    const result = await dispatch(
      createPromotion({
        title: form.title.trim(),
        ...(form.description.trim() && { description: form.description.trim() }),
        type: form.type,
        scope: form.scope,
        ...(form.scope === "CATEGORY" && form.categoryId && { categoryId: form.categoryId }),
        ...(isProductScope && form.selectedProductIds.length > 0 && { productIds: form.selectedProductIds }),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minCartValue: Number(form.minCartValue),
        ...(isBXGY && form.minQuantity && { minQuantity: Number(form.minQuantity) }),
        ...(isBXGY && form.freeQuantity && { freeQuantity: Number(form.freeQuantity) }),
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const isProductScope = PRODUCT_SCOPES.includes(form.scope);
  const isBXGY = form.type === "ADDITIONAL";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage active discount promotions.</p>
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
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
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
                  <TableCell>
                    <div className="font-medium text-gray-900">{promo.title}</div>
                    {promo.description && (
                      <div className="text-xs text-gray-400 truncate max-w-48">{promo.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={TYPE_COLORS[promo.type] ?? ""}>
                      {promo.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={SCOPE_COLORS[promo.scope] ?? ""}>
                      {promo.scope.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promo.type === "FREE_DELIVERY"
                      ? "Free delivery"
                      : promo.type === "ADDITIONAL" && promo.minQuantity && promo.freeQuantity
                      ? `Buy ${promo.minQuantity} get ${promo.freeQuantity} free`
                      : `${promo.discountValue}${promo.discountType === "PERCENTAGE" ? "%" : " RWF"}`}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {promo.minCartValue ? `${Number(promo.minCartValue).toLocaleString()} RWF` : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(promo.startsAt)}</TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(promo.endsAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="promo-desc">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="promo-desc"
                placeholder="e.g. Get 20% off everything this weekend"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                disabled={isCreating}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: v as PromotionType, minQuantity: "", freeQuantity: "" }))
                }
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISCOUNT">Discount — reduces subtotal</SelectItem>
                  <SelectItem value="ADDITIONAL">Additional — Buy X Get Y free</SelectItem>
                  <SelectItem value="FREE_DELIVERY">Free Delivery — waives delivery fee</SelectItem>
                  <SelectItem value="CASHBACK">Cashback — credited to wallet after delivery</SelectItem>
                  <SelectItem value="FLASH_SALE">Flash Sale — time-limited steep discount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BXGY fields */}
            {isBXGY && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="promo-min-qty">
                    Buy Qty <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="promo-min-qty"
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    value={form.minQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
                    required={isBXGY}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-free-qty">
                    Get Free Qty <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="promo-free-qty"
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={form.freeQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, freeQuantity: e.target.value }))}
                    required={isBXGY}
                    disabled={isCreating}
                  />
                </div>
              </div>
            )}

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
                  <SelectItem value="CART_WIDE">Cart Wide — entire cart</SelectItem>
                  <SelectItem value="CATEGORY">Category — specific category</SelectItem>
                  <SelectItem value="PRODUCT">Product — single product</SelectItem>
                  <SelectItem value="SPECIFIC">Specific — listed products</SelectItem>
                  <SelectItem value="BUNDLE">Bundle — all products must be in cart</SelectItem>
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

            {/* Product multi-picker for PRODUCT / SPECIFIC / BUNDLE */}
            {isProductScope && (
              <div className="space-y-2">
                <Label>
                  Products <span className="text-red-500">*</span>
                </Label>

                {form.selectedProductIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.selectedProductIds.map((id) => {
                      const name = products.find((p) => p.id === id)?.name ?? id;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5"
                        >
                          {name}
                          <button type="button" onClick={() => toggleProduct(id)} className="hover:text-blue-900">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

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
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${selected ? "bg-blue-50" : ""}`}
                        >
                          <span
                            className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                              selected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                            }`}
                          >
                            {selected && (
                              <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white fill-current">
                                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className="truncate font-medium text-gray-800">{product.name}</span>
                          <span className="ml-auto text-xs text-gray-400 shrink-0">{product.price} RWF</span>
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
                onValueChange={(v) => setForm((f) => ({ ...f, discountType: v as DiscountType }))}
                disabled={isCreating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed amount (RWF)</SelectItem>
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
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-min-cart">Min Cart (RWF)</Label>
                <Input
                  id="promo-min-cart"
                  type="number"
                  min="0"
                  step="any"
                  value={form.minCartValue}
                  onChange={(e) => setForm((f) => ({ ...f, minCartValue: Number(e.target.value) }))}
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
                (isProductScope && form.selectedProductIds.length === 0) ||
                (isBXGY && (!form.minQuantity || !form.freeQuantity))
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
