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
import { createSeller, clearSellerMessages, fetchSellers } from "@/store/slices/sellerSlice";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  name: "", description: "", phone: "",
  pickupLocationName: "", pickupLocationNote: "", pickupLocationUrl: "",
  pickupLatitude: "", pickupLongitude: "",
};

export function AddSellerSheet({ open, onOpenChange }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error, successMessage } = useAppSelector((s) => s.sellers);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setForm(emptyForm);
        clearLogo();
        dispatch(clearSellerMessages());
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dispatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!logoFile) return;

    const result = await dispatch(createSeller({
      sellerName: form.name,
      description: form.description,
      logoFile,
      phone: form.phone,
      pickupLocationName: form.pickupLocationName,
      pickupLocationNote: form.pickupLocationNote,
      pickupLocationUrl: form.pickupLocationUrl,
      pickupLatitude: parseFloat(form.pickupLatitude) || 0,
      pickupLongitude: parseFloat(form.pickupLongitude) || 0,
    }));

    if (createSeller.fulfilled.match(result)) {
      onOpenChange(false);
      dispatch(fetchSellers({ page: 1, limit: 20 }));
    }
  };

  const textFields = [
    { id: "name", label: "Business Name", placeholder: "Main Canteen", required: true },
    { id: "phone", label: "Phone Number", placeholder: "+250788000000", required: true },
    { id: "pickupLocationName", label: "Pickup Location Name", placeholder: "E.g., KG 11 Ave", required: true },
    { id: "pickupLocationNote", label: "Pickup Location Note", placeholder: "Near the main gate..." },
    { id: "pickupLocationUrl", label: "Pickup Location Map URL", placeholder: "https://maps.google.com/..." },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md px-6" side="right">
        <SheetHeader>
          <SheetTitle>Add New Seller</SheetTitle>
          <SheetDescription>Register a new seller by filling out the basic profile and pickup information below.</SheetDescription>
        </SheetHeader>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-4">{error}</div>}
        {successMessage && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mt-4">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 pb-10">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {logoPreview ? (
              <div className="relative w-full h-36 rounded-lg border border-gray-200 overflow-hidden group">
                <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-600" />
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
            {!logoFile && <p className="text-xs text-red-500">A logo image is required.</p>}
          </div>

          {textFields.map(({ id, label, placeholder, required }) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{label}</Label>
              <Input
                id={id}
                value={form[id as keyof typeof emptyForm]}
                onChange={set(id as keyof typeof emptyForm)}
                placeholder={placeholder}
                required={required}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={set("description")}
              placeholder="Short description of the seller"
            />
          </div>

          <div className="flex gap-4">
            {[
              { id: "pickupLatitude", label: "Latitude", placeholder: "-1.95" },
              { id: "pickupLongitude", label: "Longitude", placeholder: "30.06" },
            ].map(({ id, label, placeholder }) => (
              <div key={id} className="space-y-2 flex-1">
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  type="number"
                  step="any"
                  value={form[id as keyof typeof emptyForm]}
                  onChange={set(id as keyof typeof emptyForm)}
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
            disabled={isLoading || !logoFile}
          >
            {isLoading ? "Creating..." : "Save Seller"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
