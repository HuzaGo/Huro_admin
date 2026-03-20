"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createBatch, clearBatchMessages } from "@/store/slices/batchSlice";
import { fetchDeliveryZones } from "@/store/slices/deliveryZoneSlice";
import { fetchRiders } from "@/store/slices/riderSlice";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  slotLabel: "",
  scheduledAt: "",
  cutoffAt: "",
  maxOrders: 15,
  deliveryZoneId: "",
  riderId: "",
};

export function AddBatchSheet({ open, onOpenChange }: Props) {
  const dispatch = useAppDispatch();
  const { isCreating, error, successMessage } = useAppSelector((s) => s.batches);
  const { zones } = useAppSelector((s) => s.deliveryZones);
  const { riders } = useAppSelector((s) => s.riders);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      dispatch(fetchDeliveryZones(undefined));
      dispatch(fetchRiders({ limit: 100 }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (successMessage) {
      onOpenChange(false);
      setForm(emptyForm);
      const t = setTimeout(() => dispatch(clearBatchMessages()), 2000);
      return () => clearTimeout(t);
    }
  }, [successMessage, onOpenChange, dispatch]);

  const handleClose = () => {
    onOpenChange(false);
    dispatch(clearBatchMessages());
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "maxOrders" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelect = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(
      createBatch({
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        cutoffAt: new Date(form.cutoffAt).toISOString(),
      })
    );
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Create New Batch</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slotLabel">Slot Label</Label>
            <Input
              id="slotLabel"
              name="slotLabel"
              placeholder="e.g. 12:00 - 12:30"
              value={form.slotLabel}
              onChange={handleInput}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scheduledAt">Scheduled At</Label>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={handleInput}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cutoffAt">Cutoff At</Label>
              <Input
                id="cutoffAt"
                name="cutoffAt"
                type="datetime-local"
                value={form.cutoffAt}
                onChange={handleInput}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maxOrders">Max Orders</Label>
            <Input
              id="maxOrders"
              name="maxOrders"
              type="number"
              min="1"
              value={form.maxOrders}
              onChange={handleInput}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Delivery Zone</Label>
            <Select
              value={form.deliveryZoneId}
              onValueChange={(v) => handleSelect("deliveryZoneId", v ?? "")}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.length === 0 ? (
                  <SelectItem value="_empty" disabled>No zones available</SelectItem>
                ) : (
                  zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Assigned Rider</Label>
            <Select
              value={form.riderId}
              onValueChange={(v) => handleSelect("riderId", v ?? "")}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rider" />
              </SelectTrigger>
              <SelectContent>
                {riders.length === 0 ? (
                  <SelectItem value="_empty" disabled>No riders available</SelectItem>
                ) : (
                  riders.map((rider) => (
                    <SelectItem key={rider.id} value={rider.id}>
                      {rider.user.fullName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Batch"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
