"use client";

import { useEffect, useState } from "react";
import { MapPin, Bike, Plus, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  toggleDeliveryZone,
  clearCreateMessages,
  clearUpdateMessages,
  DeliveryZone,
  DeliveryZoneType,
} from "@/store/slices/deliveryZoneSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const TYPE_TABS: { label: string; value: DeliveryZoneType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Campus", value: "CAMPUS" },
  { label: "External", value: "EXTERNAL" },
];

const emptyForm = {
  name: "",
  type: "CAMPUS" as DeliveryZoneType,
  deliveryFee: 0,
  pickupLabel: "",
  description: "",
};

export default function DeliveryZonesPage() {
  const dispatch = useAppDispatch();
  const {
    zones, isFetching, error,
    isCreating, createError, createSuccess,
    isUpdating, updateError, updateSuccess,
    isDeleting, deleteError,
    isToggling, toggleWarning,
  } = useAppSelector((s) => s.deliveryZones);

  const [activeTab, setActiveTab] = useState<DeliveryZoneType | "ALL">("ALL");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDeliveryZones(activeTab === "ALL" ? undefined : activeTab));
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (!isSheetOpen) {
      setTimeout(() => {
        setForm(emptyForm);
        setEditingZone(null);
        dispatch(clearCreateMessages());
        dispatch(clearUpdateMessages());
      }, 300);
    }
  }, [isSheetOpen, dispatch]);

  const openCreate = () => {
    setEditingZone(null);
    setForm(emptyForm);
    setIsSheetOpen(true);
  };

  const openEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setForm({
      name: zone.name,
      type: zone.type,
      deliveryFee: zone.deliveryFee,
      pickupLabel: zone.pickupLabel,
      description: zone.description ?? "",
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      type: form.type,
      deliveryFee: Number(form.deliveryFee),
      pickupLabel: form.pickupLabel,
      description: form.description || undefined,
    };

    let result;
    if (editingZone) {
      result = await dispatch(updateDeliveryZone({ zoneId: editingZone.id, ...payload }));
    } else {
      result = await dispatch(createDeliveryZone(payload));
    }

    const matched = editingZone
      ? updateDeliveryZone.fulfilled.match(result)
      : createDeliveryZone.fulfilled.match(result);

    if (matched) {
      setIsSheetOpen(false);
      dispatch(fetchDeliveryZones(activeTab === "ALL" ? undefined : activeTab));
    }
  };

  const isSubmitting = isCreating || isUpdating;
  const formError = editingZone ? updateError : createError;
  const formSuccess = editingZone ? updateSuccess : createSuccess;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-sm text-gray-500 mt-1">CAMPUS gates and EXTERNAL delivery areas.</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Zone
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {TYPE_TABS.map((t) => (
          <Button
            key={t.value}
            variant={activeTab === t.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : zones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <MapPin className="h-10 w-10" />
          <p className="text-sm">No delivery zones found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <Card key={zone.id} className="border-gray-100 shadow-xs rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {zone.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className={
                        zone.type === "CAMPUS"
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-50"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-50"
                      }
                    >
                      {zone.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-gray-700"
                      onClick={() => openEdit(zone)}
                      disabled={isDeleting}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-600"
                      onClick={() => setConfirmDeleteId(zone.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {zone.pickupLabel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Bike className="h-4 w-4 text-gray-400" />
                    <span>
                      Delivery fee:{" "}
                      <span className="font-semibold text-gray-900">
                        {zone.deliveryFee === 0
                          ? "Free"
                          : `${zone.deliveryFee.toLocaleString()} RWF`}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => dispatch(toggleDeliveryZone(zone.id))}
                    disabled={isToggling}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                      zone.isActive === false ? "bg-gray-300" : "bg-green-500"
                    }`}
                    title={zone.isActive === false ? "Inactive — click to activate" : "Active — click to deactivate"}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        zone.isActive === false ? "translate-x-0" : "translate-x-4"
                      }`}
                    />
                  </button>
                </div>
                {toggleWarning && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    {toggleWarning}
                  </p>
                )}
                {confirmDeleteId === zone.id && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
                    <p className="text-xs text-red-700 font-medium">Delete this zone?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white"
                        disabled={isDeleting}
                        onClick={async () => {
                          await dispatch(deleteDeliveryZone(zone.id));
                          setConfirmDeleteId(null);
                        }}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                    {deleteError && (
                      <p className="text-xs text-red-600">{deleteError}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto px-6 py-8">
          <SheetHeader>
            <SheetTitle>{editingZone ? "Edit Delivery Zone" : "Create Delivery Zone"}</SheetTitle>
            <SheetDescription>
              {editingZone
                ? "Update the details of this delivery zone."
                : "Add a new campus gate or external delivery area."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {formError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {formSuccess}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="zone-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="zone-name"
                placeholder="e.g. Gate A"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone-type">Type <span className="text-red-500">*</span></Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as DeliveryZoneType }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="zone-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAMPUS">CAMPUS</SelectItem>
                  <SelectItem value="EXTERNAL">EXTERNAL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone-fee">Delivery Fee (RWF) <span className="text-red-500">*</span></Label>
              <Input
                id="zone-fee"
                type="number"
                min="0"
                value={form.deliveryFee}
                onChange={(e) => setForm((f) => ({ ...f, deliveryFee: Number(e.target.value) }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone-label">Pickup Label <span className="text-red-500">*</span></Label>
              <Input
                id="zone-label"
                placeholder="e.g. Meet at the main gate"
                value={form.pickupLabel}
                onChange={(e) => setForm((f) => ({ ...f, pickupLabel: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone-desc">Description</Label>
              <Textarea
                id="zone-desc"
                placeholder="Optional details about this zone..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting
                ? editingZone ? "Updating..." : "Creating..."
                : editingZone ? "Update Zone" : "Create Zone"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
