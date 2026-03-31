"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, X, Search, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActivePromotions,
  createPromotion,
  clearPromotionMessages,
  PromotionScope,
  PromotionType,
  DiscountType,
  PromotionProduct,
  PromotionCategoryGate,
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

// Scopes that require a products array
const PRODUCT_SCOPES: PromotionScope[] = ["SPECIFIC", "BUNDLE", "PRODUCT"];

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

interface FormState {
  title: string;
  description: string;
  bannerUrl: string;
  type: PromotionType;
  scope: PromotionScope;
  categoryId: string;
  products: PromotionProduct[];
  categoryGates: PromotionCategoryGate[];
  discountType: DiscountType;
  discountValue: string;
  minCartValue: string;
  minQuantity: string;
  freeQuantity: string;
  startsAt: string;
  endsAt: string;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  bannerUrl: "",
  type: "DISCOUNT",
  scope: "CART_WIDE",
  categoryId: "",
  products: [],
  categoryGates: [],
  discountType: "PERCENTAGE",
  discountValue: "",
  minCartValue: "",
  minQuantity: "",
  freeQuantity: "",
  startsAt: "",
  endsAt: "",
};

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
  const [catGateSearch, setCatGateSearch] = useState("");

  useEffect(() => { dispatch(fetchActivePromotions()); }, [dispatch]);

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
        setCatGateSearch("");
        dispatch(clearPromotionMessages());
      }, 300);
    }
  }, [isSheetOpen, dispatch]);

  // ── Product helpers ──────────────────────────────────────────────────
  const addProduct = (productId: string) => {
    if (form.products.find((p) => p.productId === productId)) return;
    setForm((f) => ({
      ...f,
      products: [...f.products, { productId, requiredQuantity: 1, isFreeItem: false }],
    }));
  };

  const removeProduct = (productId: string) =>
    setForm((f) => ({ ...f, products: f.products.filter((p) => p.productId !== productId) }));

  const updateProduct = (productId: string, key: "requiredQuantity" | "isFreeItem", value: number | boolean) =>
    setForm((f) => ({
      ...f,
      products: f.products.map((p) =>
        p.productId === productId ? { ...p, [key]: value } : p
      ),
    }));

  // ── Category gate helpers ────────────────────────────────────────────
  const addCategoryGate = (categoryId: string) => {
    if (form.categoryGates.find((g) => g.categoryId === categoryId)) return;
    setForm((f) => ({
      ...f,
      categoryGates: [...f.categoryGates, { categoryId, requiredQuantity: 1 }],
    }));
  };

  const removeCategoryGate = (categoryId: string) =>
    setForm((f) => ({ ...f, categoryGates: f.categoryGates.filter((g) => g.categoryId !== categoryId) }));

  const updateCategoryGateQty = (categoryId: string, qty: number) =>
    setForm((f) => ({
      ...f,
      categoryGates: f.categoryGates.map((g) =>
        g.categoryId === categoryId ? { ...g, requiredQuantity: qty } : g
      ),
    }));

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const startsAt = new Date(form.startsAt);
    const endsAt = new Date(form.endsAt);
    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime()) || endsAt <= startsAt) return;

    const isProductScope = PRODUCT_SCOPES.includes(form.scope);
    // ADDITIONAL type doesn't need discountType/discountValue
    const skipDiscount = form.type === "ADDITIONAL";

    const result = await dispatch(
      createPromotion({
        title: form.title.trim(),
        ...(form.description.trim() && { description: form.description.trim() }),
        ...(form.bannerUrl.trim() && { bannerUrl: form.bannerUrl.trim() }),
        type: form.type,
        scope: form.scope,
        ...(form.scope === "CATEGORY" && form.categoryId && { categoryId: form.categoryId }),
        ...(isProductScope && form.products.length > 0 && { products: form.products }),
        ...(form.scope === "BUNDLE" && form.categoryGates.length > 0 && { categoryGates: form.categoryGates }),
        ...(!skipDiscount && { discountType: form.discountType }),
        ...(!skipDiscount && form.discountValue !== "" && { discountValue: Number(form.discountValue) }),
        ...(form.minCartValue !== "" && { minCartValue: Number(form.minCartValue) }),
        ...(form.minQuantity !== "" && { minQuantity: Number(form.minQuantity) }),
        ...(form.freeQuantity !== "" && { freeQuantity: Number(form.freeQuantity) }),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      })
    );

    if (createPromotion.fulfilled.match(result)) setIsSheetOpen(false);
  };

  // ── Derived ──────────────────────────────────────────────────────────
  const isProductScope = PRODUCT_SCOPES.includes(form.scope);
  const isBXGY = form.type === "ADDITIONAL";
  const skipDiscount = isBXGY;

  const unselectedProducts = products.filter(
    (p) => !form.products.find((fp) => fp.productId === p.id) &&
      p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const unselectedCategories = categories.filter(
    (c) => !form.categoryGates.find((g) => g.categoryId === c.id) &&
      c.name.toLowerCase().includes(catGateSearch.toLowerCase())
  );

  const formatDate = (iso: string) => iso ? new Date(iso).toLocaleDateString() : "—";

  const isSubmitDisabled =
    isCreating ||
    !form.title.trim() ||
    !form.startsAt ||
    !form.endsAt ||
    (form.scope === "CATEGORY" && !form.categoryId) ||
    (isProductScope && form.products.length === 0) ||
    (!skipDiscount && form.discountValue === "");

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
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">{activeError}</div>
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
                  <TableCell className="text-sm">
                    {promo.type === "FREE_DELIVERY"
                      ? "Free delivery"
                      : promo.type === "ADDITIONAL" && promo.minQuantity && promo.freeQuantity
                      ? `Buy ${promo.minQuantity} get ${promo.freeQuantity} free`
                      : promo.discountValue
                      ? `${promo.discountValue}${promo.discountType === "PERCENTAGE" ? "%" : " RWF"}`
                      : "—"}
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

      {/* ── Create Sheet ── */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-full overflow-y-auto px-6 py-8">
          <SheetHeader>
            <SheetTitle>New Promotion</SheetTitle>
            <SheetDescription>Fill in the details to create a promotion.</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {createError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">{createError}</div>
            )}
            {createSuccess && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">{createSuccess}</div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="promo-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="promo-title"
                placeholder="e.g. 20% Off Everything"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required disabled={isCreating}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="promo-desc">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input
                id="promo-desc"
                placeholder="e.g. Weekend sale — save big"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                disabled={isCreating}
              />
            </div>

            {/* Banner URL */}
            <div className="space-y-2">
              <Label htmlFor="promo-banner">Banner URL <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input
                id="promo-banner"
                placeholder="https://..."
                value={form.bannerUrl}
                onChange={(e) => setForm((f) => ({ ...f, bannerUrl: e.target.value }))}
                disabled={isCreating}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type <span className="text-red-500">*</span></Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as PromotionType, minQuantity: "", freeQuantity: "" }))}
                disabled={isCreating}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISCOUNT">Discount — reduces subtotal</SelectItem>
                  <SelectItem value="ADDITIONAL">Additional — Buy X Get Y free</SelectItem>
                  <SelectItem value="FREE_DELIVERY">Free Delivery — waives delivery fee</SelectItem>
                  <SelectItem value="CASHBACK">Cashback — credited to wallet after delivery</SelectItem>
                  <SelectItem value="FLASH_SALE">Flash Sale — time-limited discount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BXGY fields — only for ADDITIONAL */}
            {isBXGY && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="promo-min-qty">Buy Qty <span className="text-red-500">*</span></Label>
                  <Input
                    id="promo-min-qty"
                    type="number" min="1" placeholder="e.g. 3"
                    value={form.minQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-free-qty">Get Free Qty <span className="text-red-500">*</span></Label>
                  <Input
                    id="promo-free-qty"
                    type="number" min="1" placeholder="e.g. 1"
                    value={form.freeQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, freeQuantity: e.target.value }))}
                    disabled={isCreating}
                  />
                </div>
              </div>
            )}

            {/* Scope */}
            <div className="space-y-2">
              <Label>Scope <span className="text-red-500">*</span></Label>
              <Select
                value={form.scope}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, scope: v as PromotionScope, categoryId: "", products: [], categoryGates: [] }))
                }
                disabled={isCreating}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v ?? "" }))}
                  disabled={isCreating}
                >
                  <SelectTrigger><SelectValue placeholder="Select a category…" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Products picker — for SPECIFIC, PRODUCT, BUNDLE */}
            {isProductScope && (
              <div className="space-y-3">
                <Label>Products <span className="text-red-500">*</span></Label>

                {/* Selected products */}
                {form.products.length > 0 && (
                  <div className="space-y-2">
                    {form.products.map((fp) => {
                      const product = products.find((p) => p.id === fp.productId);
                      return (
                        <div key={fp.productId} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                            {product?.name ?? fp.productId}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-gray-500">Qty</span>
                            <Input
                              type="number" min="1"
                              value={fp.requiredQuantity}
                              onChange={(e) => updateProduct(fp.productId, "requiredQuantity", Number(e.target.value))}
                              className="w-14 h-7 text-xs px-2"
                              disabled={isCreating}
                            />
                          </div>
                          {/* isFreeItem toggle — only meaningful for BUNDLE */}
                          {form.scope === "BUNDLE" && (
                            <button
                              type="button"
                              onClick={() => updateProduct(fp.productId, "isFreeItem", !fp.isFreeItem)}
                              disabled={isCreating}
                              className={`text-xs px-2 py-1 rounded-full border font-medium transition-colors ${
                                fp.isFreeItem
                                  ? "bg-green-50 text-green-700 border-green-300"
                                  : "bg-gray-50 text-gray-500 border-gray-200"
                              }`}
                            >
                              {fp.isFreeItem ? "Free" : "Gate"}
                            </button>
                          )}
                          <button type="button" onClick={() => removeProduct(fp.productId)} disabled={isCreating}>
                            <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Product search + picker */}
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="relative border-b border-gray-100">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search products to add…"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-8 text-sm border-0 rounded-none focus-visible:ring-0"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto">
                    {unselectedProducts.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">
                        {products.length === 0 ? "Loading products…" : "No more products."}
                      </p>
                    ) : (
                      unselectedProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p.id)}
                          disabled={isCreating}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <span className="font-medium text-gray-800 truncate">{p.name}</span>
                          <span className="text-xs text-gray-400 shrink-0 ml-2">{p.price} RWF</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
                {form.products.length === 0 && (
                  <p className="text-xs text-gray-400">Select at least one product.</p>
                )}
              </div>
            )}

            {/* Category Gates — only for BUNDLE */}
            {form.scope === "BUNDLE" && (
              <div className="space-y-3">
                <Label>Category Gates <span className="text-gray-400 font-normal">(optional)</span></Label>

                {form.categoryGates.length > 0 && (
                  <div className="space-y-2">
                    {form.categoryGates.map((gate) => {
                      const cat = categories.find((c) => c.id === gate.categoryId);
                      return (
                        <div key={gate.categoryId} className="flex items-center gap-2 p-2 rounded-lg bg-teal-50 border border-teal-100">
                          <span className="flex-1 text-sm font-medium text-teal-800 truncate">
                            {cat?.name ?? gate.categoryId}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-teal-600">Qty</span>
                            <Input
                              type="number" min="1"
                              value={gate.requiredQuantity}
                              onChange={(e) => updateCategoryGateQty(gate.categoryId, Number(e.target.value))}
                              className="w-14 h-7 text-xs px-2"
                              disabled={isCreating}
                            />
                          </div>
                          <button type="button" onClick={() => removeCategoryGate(gate.categoryId)} disabled={isCreating}>
                            <Trash2 className="h-3.5 w-3.5 text-teal-400 hover:text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="relative border-b border-gray-100">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search categories to add…"
                      value={catGateSearch}
                      onChange={(e) => setCatGateSearch(e.target.value)}
                      className="pl-8 text-sm border-0 rounded-none focus-visible:ring-0"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="max-h-28 overflow-y-auto">
                    {unselectedCategories.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">No categories available.</p>
                    ) : (
                      unselectedCategories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => addCategoryGate(c.id)}
                          disabled={isCreating}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-teal-50 transition-colors border-b border-gray-50 last:border-0 font-medium text-gray-800"
                        >
                          {c.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Discount Type + Value — hidden for ADDITIONAL */}
            {!skipDiscount && (
              <>
                <div className="space-y-2">
                  <Label>Discount Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.discountType}
                    onValueChange={(v) => setForm((f) => ({ ...f, discountType: v as DiscountType }))}
                    disabled={isCreating}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed amount (RWF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="promo-discount-val">
                      {form.discountType === "PERCENTAGE" ? "Discount %" : "Discount (RWF)"}
                      {" "}<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="promo-discount-val"
                      type="number" min="0"
                      max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                      step="any" placeholder="0"
                      value={form.discountValue}
                      onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                      required={!skipDiscount} disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo-min-cart">Min Cart (RWF)</Label>
                    <Input
                      id="promo-min-cart"
                      type="number" min="0" step="any" placeholder="0"
                      value={form.minCartValue}
                      onChange={(e) => setForm((f) => ({ ...f, minCartValue: e.target.value }))}
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="promo-starts">Starts At <span className="text-red-500">*</span></Label>
                <Input
                  id="promo-starts" type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                  required disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-ends">Ends At <span className="text-red-500">*</span></Label>
                <Input
                  id="promo-ends" type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                  required disabled={isCreating}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitDisabled}>
              {isCreating ? "Creating..." : "Create Promotion"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
