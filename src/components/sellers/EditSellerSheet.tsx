"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSeller, clearSellerMessages, fetchSellers } from "@/store/slices/sellerSlice";
import type { Seller } from "@/store/slices/sellerSlice";

interface Props {
  seller: Seller;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSellerSheet({ seller, open, onOpenChange }: Props) {
  const dispatch = useAppDispatch();
  const { isUpdating, updateError, successMessage } = useAppSelector((s) => s.sellers);

  const [form, setForm] = useState({
    sellerName: "",
    sellerPhone: "",
    pickupLocationName: "",
    pickupLocationNote: "",
    pickupLocationUrl: "",
    pickupLatitude: "",
    pickupLongitude: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when seller changes
  useEffect(() => {
    if (open) {
      setForm({
        sellerName: seller.name ?? "",
        sellerPhone: seller.phone ?? "",
        pickupLocationName: seller.pickupLocationName ?? "",
        pickupLocationNote: seller.pickupLocationNote ?? "",
        pickupLocationUrl: seller.pickupLocationUrl ?? "",
        pickupLatitude: seller.pickupLatitude != null ? String(seller.pickupLatitude) : "",
        pickupLongitude: seller.pickupLongitude != null ? String(seller.pickupLongitude) : "",
      });
      setLogoFile(null);
      setLogoPreview(null);
    }
  }, [open, seller]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => dispatch(clearSellerMessages()), 300);
    }
  }, [open, dispatch]);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const result = await dispatch(updateSeller({
      sellerId: seller.id,
      sellerName: form.sellerName || undefined,
      sellerPhone: form.sellerPhone || undefined,
      logoFile: logoFile ?? undefined,
      pickupLocationName: form.pickupLocationName || undefined,
      pickupLocationNote: form.pickupLocationNote || undefined,
      pickupLocationUrl: form.pickupLocationUrl || undefined,
      pickupLatitude: form.pickupLatitude ? parseFloat(form.pickupLatitude) : undefined,
      pickupLongitude: form.pickupLongitude ? parseFloat(form.pickupLongitude) : undefined,
    }));

    if (updateSeller.fulfilled.match(result)) {
      onOpenChange(false);
      dispatch(fetchSellers({ page: 1, limit: 20 }));
    }
  };

  const currentLogo = logoPreview ?? seller.logoUrl;

  const textFields = [
    { id: "sellerName", label: "Business Name", placeholder: "Main Canteen" },
    { id: "sellerPhone", label: "Phone Number", placeholder: "+250788000000" },
    { id: "pickupLocationName", label: "Pickup Location Name", placeholder: "E.g., KG 11 Ave" },
    { id: "pickupLocationNote", label: "Pickup Location Note", placeholder: "Near the main gate..." },
    { id: "pickupLocationUrl", label: "Pickup Location Map URL", placeholder: "https://maps.google.com/..." },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md px-6" side="right">
        <SheetHeader>
          <SheetTitle>Edit Seller</SheetTitle>
          <SheetDescription>Update the seller's profile and pickup details. Only changed fields are sent.</SheetDescription>
        </SheetHeader>

        {updateError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-4">{updateError}</div>
        )}
        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mt-4">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 pb-10">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo <span className="text-gray-400 text-xs">(leave empty to keep current)</span></Label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {currentLogo ? (
              <div className="relative w-full h-36 rounded-lg border border-gray-200 overflow-hidden group">
                <Image src={currentLogo} alt="Logo preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white text-xs text-gray-600 px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Click to upload logo</span>
                <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
              </button>
            )}
          </div>

          {textFields.map(({ id, label, placeholder }) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                value={form[id]}
                onChange={set(id)}
                placeholder={placeholder}
                disabled={isUpdating}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={seller.description ?? ""}
              placeholder="Short description of the seller"
              disabled
              className="opacity-60"
            />
          </div>

          <div className="flex gap-4">
            {(["pickupLatitude", "pickupLongitude"] as const).map((id) => (
              <div key={id} className="space-y-2 flex-1">
                <Label htmlFor={id}>{id === "pickupLatitude" ? "Latitude" : "Longitude"}</Label>
                <Input
                  id={id}
                  type="number"
                  step="any"
                  value={form[id]}
                  onChange={set(id)}
                  placeholder={id === "pickupLatitude" ? "-1.95" : "30.06"}
                  disabled={isUpdating}
                />
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
