"use client";

import { useEffect, useState } from "react";
import { School, Plus, Pencil } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCampuses,
  fetchCampusGates,
  createCampusGate,
  updateCampusGate,
  toggleCampus,
  clearGateMessages,
  Campus,
  Gate,
} from "@/store/slices/campusSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const emptyGateForm = {
  name: "",
  pickupLabel: "",
  latitude: 0,
  longitude: 0,
  googleMapsUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function CampusesPage() {
  const dispatch = useAppDispatch();
  const {
    campuses,
    gates,
    isFetchingGates,
    isFetching,
    error,
    isCreatingGate,
    createGateError,
    createGateSuccess,
    isUpdatingGate,
    updateGateError,
    updateGateSuccess,
    isToggling,
  } = useAppSelector((s) => s.campuses);

  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [editingGate, setEditingGate] = useState<Gate | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [form, setForm] = useState(emptyGateForm);

  useEffect(() => {
    dispatch(fetchCampuses());
  }, [dispatch]);

  useEffect(() => {
    campuses.forEach((campus) => {
      dispatch(fetchCampusGates(campus.id));
    });
  }, [dispatch, campuses]);

  useEffect(() => {
    if (!isSheetOpen) {
      setTimeout(() => {
        setForm(emptyGateForm);
        setSelectedCampus(null);
        setEditingGate(null);
        dispatch(clearGateMessages());
      }, 300);
    }
  }, [isSheetOpen, dispatch]);

  const openAddGate = (campus: Campus) => {
    setSelectedCampus(campus);
    setEditingGate(null);
    setForm(emptyGateForm);
    setIsSheetOpen(true);
  };

  const openEditGate = (campus: Campus, gate: Gate) => {
    setSelectedCampus(campus);
    setEditingGate(gate);
    setForm({
      name: gate.name,
      pickupLabel: gate.pickupLabel,
      latitude: gate.latitude,
      longitude: gate.longitude,
      googleMapsUrl: gate.googleMapsUrl ?? "",
      sortOrder: gate.sortOrder ?? 0,
      isActive: gate.isActive,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedCampus) return;

    let result;
    if (editingGate) {
      result = await dispatch(
        updateCampusGate({
          zoneId: selectedCampus.id,
          gateId: editingGate.id,
          name: form.name,
          pickupLabel: form.pickupLabel,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          googleMapsUrl: form.googleMapsUrl || undefined,
          sortOrder: Number(form.sortOrder),
          isActive: form.isActive,
        })
      );
    } else {
      result = await dispatch(
        createCampusGate({
          zoneId: selectedCampus.id,
          name: form.name,
          pickupLabel: form.pickupLabel,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          googleMapsUrl: form.googleMapsUrl || undefined,
          sortOrder: Number(form.sortOrder),
        })
      );
    }

    const matched = editingGate
      ? updateCampusGate.fulfilled.match(result)
      : createCampusGate.fulfilled.match(result);

    if (matched) {
      setIsSheetOpen(false);
    }
  };

  const isSubmitting = isCreatingGate || isUpdatingGate;
  const formError = editingGate ? updateGateError : createGateError;
  const formSuccess = editingGate ? updateGateSuccess : createGateSuccess;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Campuses</h1>
        <p className="text-sm text-gray-500 mt-1">All available campus zones.</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : campuses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <School className="h-10 w-10" />
          <p className="text-sm">No campuses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campuses.map((campus) => {
            const campusGates = gates?.[campus.id] ?? [];
            return (
              <Card key={campus.id} className="border-gray-100 shadow-xs rounded-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-gray-900">
                      {campus.name}
                    </CardTitle>
                    <button
                      onClick={() => dispatch(toggleCampus(campus.id))}
                      disabled={isToggling}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                        campus.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={campus.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                          campus.isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 font-mono truncate mt-1">{campus.id}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Gates list */}
                  {isFetchingGates?.[campus.id] ? (
                    <div className="space-y-1.5">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-8 rounded-md bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : campusGates.length > 0 && (
                    <div className="space-y-1.5">
                      {campusGates.map((gate) => (
                        <div
                          key={gate.id}
                          className="flex items-center justify-between rounded-md bg-gray-50 px-2.5 py-1.5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge
                              variant="secondary"
                              className={
                                gate.isActive
                                  ? "bg-green-50 text-green-600 hover:bg-green-50 shrink-0"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-100 shrink-0"
                              }
                            >
                              {gate.isActive ? "On" : "Off"}
                            </Badge>
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {gate.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-gray-400 hover:text-gray-700"
                            onClick={() => openEditGate(campus, gate)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => openAddGate(campus)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Gate
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Gate Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto px-6 py-8">
          <SheetHeader>
            <SheetTitle>{editingGate ? "Edit Gate" : "Add Gate"}</SheetTitle>
            <SheetDescription>
              {editingGate ? "Update the details of this gate." : "Create a new gate for"}{" "}
              {!editingGate && (
                <span className="font-medium text-gray-700">{selectedCampus?.name}</span>
              )}
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
              <Label htmlFor="gate-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="gate-name"
                placeholder="e.g. Gate A"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gate-pickup">
                Pickup Label <span className="text-red-500">*</span>
              </Label>
              <Input
                id="gate-pickup"
                placeholder="e.g. Meet at the main gate"
                value={form.pickupLabel}
                onChange={(e) => setForm((f) => ({ ...f, pickupLabel: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="gate-lat">
                  Latitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="gate-lat"
                  type="number"
                  step="any"
                  placeholder="e.g. -1.9441"
                  value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: Number(e.target.value) }))}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gate-lng">
                  Longitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="gate-lng"
                  type="number"
                  step="any"
                  placeholder="e.g. 30.0619"
                  value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: Number(e.target.value) }))}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gate-maps">Google Maps URL</Label>
              <Input
                id="gate-maps"
                placeholder="https://maps.google.com/..."
                value={form.googleMapsUrl}
                onChange={(e) => setForm((f) => ({ ...f, googleMapsUrl: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gate-order">Sort Order</Label>
              <Input
                id="gate-order"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                disabled={isSubmitting}
              />
            </div>

            {editingGate && (
              <div className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2">
                <Label htmlFor="gate-active" className="cursor-pointer">
                  Active
                </Label>
                <button
                  id="gate-active"
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  disabled={isSubmitting}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                    form.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      form.isActive ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isSubmitting || !form.name.trim() || !form.pickupLabel.trim()}
            >
              {isSubmitting
                ? editingGate ? "Updating..." : "Creating..."
                : editingGate ? "Update Gate" : "Create Gate"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
