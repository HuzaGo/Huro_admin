"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { assignRiderToBatch, fetchBatchDetail, clearAssignMessages } from "@/store/slices/batchSlice";
import { fetchRiders } from "@/store/slices/riderSlice";

interface Props {
  batchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRiderSheet({ batchId, open, onOpenChange }: Props) {
  const dispatch = useAppDispatch();
  const { isAssigning, assignError, assignSuccess } = useAppSelector((s) => s.batches);
  const { riders } = useAppSelector((s) => s.riders);

  const [riderId, setRiderId] = useState("");

  useEffect(() => {
    if (open) dispatch(fetchRiders({ limit: 100 }));
  }, [open, dispatch]);

  useEffect(() => {
    if (assignSuccess) {
      dispatch(fetchBatchDetail(batchId));
      const t = setTimeout(() => {
        dispatch(clearAssignMessages());
        onOpenChange(false);
        setRiderId("");
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [assignSuccess, batchId, onOpenChange, dispatch]);

  const handleClose = () => {
    onOpenChange(false);
    dispatch(clearAssignMessages());
    setRiderId("");
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!riderId) return;
    dispatch(assignRiderToBatch({ batchId, riderId }));
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-sm px-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Assign Rider</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {assignError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {assignError}
            </div>
          )}
          {assignSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-200">
              {assignSuccess}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Select Rider</Label>
            <Select value={riderId} onValueChange={(v) => setRiderId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a rider" />
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
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isAssigning || !riderId}
            >
              {isAssigning ? "Assigning..." : "Assign Rider"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
