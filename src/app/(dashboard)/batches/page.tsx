"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { XOctagon, Plus, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOpenBatches, fetchBatchDetail, clearBatchDetail, fetchBatchOrders, clearBatchOrders } from "@/store/slices/batchSlice";
import { AddBatchSheet } from "@/components/batches/AddBatchSheet";
import { AssignRiderSheet } from "@/components/batches/AssignRiderSheet";

export default function BatchesPage() {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const dispatch = useAppDispatch();
  const {
    openBatches, isFetching, fetchError,
    batchDetail, isFetchingDetail, detailError,
    successMessage,
    batchOrders, isFetchingOrders, ordersError,
  } = useAppSelector((s) => s.batches);

  useEffect(() => {
    dispatch(fetchOpenBatches(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) dispatch(fetchOpenBatches(undefined));
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (selectedBatchId) {
      dispatch(fetchBatchDetail(selectedBatchId));
      dispatch(fetchBatchOrders({ batchId: selectedBatchId }));
    } else {
      dispatch(clearBatchDetail());
      dispatch(clearBatchOrders());
    }
  }, [selectedBatchId, dispatch]);

  const handleRowClick = (id: string) => {
    setSelectedBatchId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-6 max-w-350 mx-auto relative">

      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-px">
        <div className="flex gap-8">
          <Button variant="ghost" className="text-[15px] font-semibold text-blue-600 border-b-2 border-b-blue-600 rounded-none pb-3 px-1 h-auto hover:bg-transparent hover:text-blue-700">
            Active Batches
          </Button>
          <Button variant="ghost" className="text-[15px] font-semibold text-slate-500 border-b-2 border-transparent rounded-none pb-3 px-1 h-auto hover:bg-transparent hover:text-slate-700">
            Completed
          </Button>
        </div>
        <div className="mb-3 md:mb-0">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold rounded-lg px-6"
            onClick={() => setIsSheetOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Batch
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Left Side: Table */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          <Card className="shadow-sm border-gray-100 overflow-hidden flex flex-col rounded-xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-b border-slate-100 border-t-0">
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14 pl-6">BATCH ID</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14">SLOT</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14">ZONE</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14">FILL</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14">SLOTS LEFT</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14 pr-6">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetching ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : fetchError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-red-500 text-sm">
                        {fetchError}
                      </TableCell>
                    </TableRow>
                  ) : openBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                        No open batches found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    openBatches.map((batch) => (
                      <TableRow
                        key={batch.id}
                        onClick={() => handleRowClick(batch.id)}
                        className={`cursor-pointer transition-colors border-b border-slate-100 ${selectedBatchId === batch.id ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'bg-white hover:bg-slate-50'}`}
                      >
                        <TableCell className="font-bold text-blue-600 py-5 pl-6 text-base font-mono">
                          {batch.id.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-[14px]">{batch.slotLabel}</span>
                            <span className="text-slate-500 text-[12px]">
                              {new Date(batch.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium py-5 text-[14px]">
                          {batch.deliveryZone?.name ?? "—"}
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${Math.min(batch.fillPercent, 100)}%` }}
                              />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700">{batch.fillPercent}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-none font-bold text-[11px]">
                            {batch.slotsRemaining} left
                          </Badge>
                        </TableCell>
                        <TableCell className="py-5 pr-6">
                          <Button variant="link" className="text-blue-600 font-bold text-[13px] p-0 h-auto">
                            View Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Right Side: Batch Detail Sidebar */}
        {selectedBatchId && (
          <div className="w-full xl:w-105 shrink-0 animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-sm border-gray-100 sticky top-6 rounded-xl overflow-hidden">
              <CardHeader className="pb-4 pt-6 px-6 relative border-b border-slate-50">
                <CardTitle className="text-[20px] font-bold text-slate-900 mb-1">
                  {batchDetail?.slotLabel ?? "Batch Detail"}
                </CardTitle>
                {batchDetail?.status && (
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-green-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {batchDetail.status}
                  </div>
                )}
                <div className="absolute right-4 top-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                    onClick={() => setSelectedBatchId(null)}
                  >
                    <XOctagon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {isFetchingDetail ? (
                <CardContent className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </CardContent>
              ) : detailError ? (
                <CardContent className="py-8 text-center text-sm text-red-500">
                  {detailError}
                </CardContent>
              ) : batchDetail ? (
                <>
                  {/* Stats */}
                  <CardContent className="px-6 py-6 border-b border-slate-50 bg-slate-50/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-100/80 rounded-xl p-4 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ORDERS</span>
                        <span className="text-2xl font-bold text-slate-900">{batchDetail.orders?.length ?? 0}</span>
                      </div>
                      <div className="bg-slate-100/80 rounded-xl p-4 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">SLOTS LEFT</span>
                        <span className="text-2xl font-bold text-blue-600">{batchDetail.slotsRemaining ?? "—"}</span>
                      </div>
                    </div>
                  </CardContent>

                  {/* Info */}
                  <CardContent className="px-6 py-6 border-b border-slate-50 space-y-3 text-[14px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Zone</span>
                      <span className="font-semibold text-slate-700">{batchDetail.deliveryZone?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Scheduled</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(batchDetail.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    {batchDetail.cutoffAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Cutoff</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(batchDetail.cutoffAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    )}
                    {batchDetail.maxOrders != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Max Orders</span>
                        <span className="font-semibold text-slate-700">{batchDetail.maxOrders}</span>
                      </div>
                    )}
                  </CardContent>

                  {/* Riders */}
                  {(() => {
                    const riderList = batchDetail.riders?.length
                      ? batchDetail.riders
                      : batchDetail.rider
                      ? [batchDetail.rider]
                      : [];
                    if (!riderList.length) return null;
                    return (
                      <CardContent className="px-6 py-5 border-b border-slate-50">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                          Assigned Rider{riderList.length > 1 ? "s" : ""}
                        </p>
                        <div className="space-y-2">
                          {riderList.map((r, i) => (
                            <div key={r.id ?? i} className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-slate-900">{r.fullName ?? "—"}</p>
                                {r.phone && <p className="text-[12px] text-slate-500">{r.phone}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    );
                  })()}

                  {/* Orders */}
                  <CardContent className="px-6 py-5 border-b border-slate-50">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Orders {batchOrders.length > 0 && `(${batchOrders.length})`}
                    </p>
                    {isFetchingOrders ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                      </div>
                    ) : ordersError ? (
                      <p className="text-sm text-red-500 text-center">{ordersError}</p>
                    ) : batchOrders.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-2">No orders in this batch.</p>
                    ) : (
                      <div className="space-y-3">
                        {batchOrders.map((order) => (
                          <div key={order.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                            {/* Header row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[12px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  {order.pickupSignature}
                                </span>
                                <Badge variant="secondary" className="text-[10px] font-bold border-none bg-slate-100 text-slate-600">
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                            {/* Customer */}
                            <div className="text-[13px]">
                              <span className="font-bold text-slate-800">{order.snapshotName}</span>
                              {order.snapshotPhone && (
                                <span className="text-slate-500 ml-1">· {order.snapshotPhone}</span>
                              )}
                            </div>
                            {/* Delivery info */}
                            {(order.deliveryName || order.customAddress) && (
                              <p className="text-[12px] text-slate-500 truncate">
                                {order.deliveryName ?? order.customAddress}
                              </p>
                            )}
                            {/* Items */}
                            {order.orderItems?.length > 0 && (
                              <div className="space-y-1 pt-1 border-t border-slate-100">
                                {order.orderItems.map((item, i) => (
                                  <div key={i} className="flex justify-between text-[12px]">
                                    <span className="text-slate-600">
                                      <span className="font-semibold text-slate-800">{item.quantity}×</span> {item.productName}
                                    </span>
                                    <span className="font-semibold text-slate-700">{item.lineTotal.toLocaleString()} RWF</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  {/* Actions */}
                  <CardContent className="px-6 py-5">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      onClick={() => setIsAssignOpen(true)}
                    >
                      Assign Rider
                    </Button>
                  </CardContent>
                </>
              ) : null}
            </Card>
          </div>
        )}

      </div>

      <AddBatchSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
      {selectedBatchId && (
        <AssignRiderSheet
          batchId={selectedBatchId}
          open={isAssignOpen}
          onOpenChange={setIsAssignOpen}
        />
      )}
    </div>
  );
}
