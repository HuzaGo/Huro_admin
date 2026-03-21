"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, MapPin, Mail, RefreshCcw, XOctagon, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrders } from "@/store/slices/orderSlice";
import type { OrderStatus } from "@/store/slices/orderSlice";

const STATUS_OPTIONS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Pending Payment", value: "PENDING_PAYMENT" },
  { label: "Paid", value: "PAID" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready for Pickup", value: "READY_FOR_PICKUP" },
  { label: "Picked Up", value: "PICKED_UP" },
  { label: "In Delivery", value: "IN_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Expired", value: "EXPIRED" },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  READY_FOR_PICKUP: "bg-cyan-100 text-cyan-700",
  PICKED_UP: "bg-indigo-100 text-indigo-700",
  IN_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
  EXPIRED: "bg-red-100 text-red-600",
};

const getStatusBadge = (status: string) => (
  <Badge
    variant="secondary"
    className={`${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"} border-none font-bold text-[10px] tracking-wide`}
  >
    {status.replace(/_/g, " ")}
  </Badge>
);

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const dispatch = useAppDispatch();
  const { orders, isFetching, error, totalCount, totalPages, currentPage } =
    useAppSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchOrders({
      page,
      limit: 20,
      status: statusFilter !== "all" ? (statusFilter as OrderStatus) : "",
    }));
  }, [page, statusFilter, dispatch]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  return (
    <div className="flex flex-col gap-6 max-w-350 mx-auto">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500 mb-1">
            Home <span className="mx-1">›</span> <span className="text-slate-900">Order Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
        </div>
        <Button variant="outline" className="bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-sm w-fit">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Left Side: Table & Filters */}
        <div className="flex-1 flex flex-col gap-4 w-full">

          {/* Filters Card */}
          <Card className="shadow-sm border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="orders-search" placeholder="Search orders…" className="pl-9 bg-slate-50 border-gray-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}
                >
                  <SelectTrigger className="bg-slate-50 border-gray-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Table Card */}
          <Card className="shadow-sm border-gray-100 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12 pl-4">ORDER ID</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">ZONE</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">BATCH</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">TOTAL</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">ITEMS</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">STATUS</TableHead>
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
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-red-500 text-sm">{error}</TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-400 text-sm">No orders found.</TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow
                        key={order.id}
                        onClick={() => setSelectedOrderId((prev) => prev === order.id ? null : order.id)}
                        className={`cursor-pointer transition-colors border-b border-slate-50 hover:bg-slate-50 ${selectedOrderId === order.id ? 'bg-blue-50/40 hover:bg-blue-50/60' : ''}`}
                      >
                        <TableCell className="font-bold text-blue-600 py-4 pl-4 font-mono text-[13px]">
                          {order.id.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-slate-900 font-bold py-4">
                          {order.snapshotZoneName ?? "—"}
                        </TableCell>
                        <TableCell className="text-slate-600 py-4 font-medium">
                          {order.batch?.slotLabel ?? "—"}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium py-4">
                          {order.payableAmount ? `${Number(order.payableAmount).toLocaleString()} RWF` : "—"}
                        </TableCell>
                        <TableCell className="text-slate-600 py-4 font-medium text-center">
                          {order.itemCount ?? "—"}
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(order.status)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white mt-auto">
              <p className="text-sm font-medium text-slate-500">
                {totalCount > 0 ? `Showing page ${currentPage} of ${totalPages} (${totalCount} orders)` : "No orders"}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-600 font-medium"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-600 font-medium"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Side: Order Details Sidebar */}
        {selectedOrder && (
          <div className="w-full xl:w-95 shrink-0 animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-sm border-gray-100 sticky top-6">
              <CardHeader className="pb-4 pt-6 px-6 relative">
                <CardTitle className="text-xl font-bold text-slate-900">Order Details</CardTitle>
                {selectedOrder.pickupSignature && (
                  <p className="text-sm text-slate-500 font-mono mt-0.5">
                    Code: <span className="font-bold text-blue-600">{selectedOrder.pickupSignature}</span>
                  </p>
                )}
                <div className="absolute right-4 top-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                    onClick={() => setSelectedOrderId(null)}
                  >
                    <XOctagon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">

                {/* Status */}
                <div className="mb-5">{getStatusBadge(selectedOrder.status)}</div>

                {/* Customer Info */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <h3 className="font-bold text-slate-900 text-[15px]">
                      {selectedOrder.customer?.fullName ?? "—"}
                    </h3>
                    {selectedOrder.customer?.email && (
                      <span className="text-[13px] text-slate-500 mb-1">{selectedOrder.customer.email}</span>
                    )}
                    {(selectedOrder.deliveryName || selectedOrder.customAddress) && (
                      <div className="flex items-center text-[12px] text-slate-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        {selectedOrder.deliveryName ?? selectedOrder.customAddress}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Items</h4>
                    <div className="flex flex-col gap-3">
                      {selectedOrder.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-start text-[14px]">
                          <div className="flex gap-2 font-medium">
                            <span className="text-blue-600 font-bold">{item.quantity}×</span>
                            <span className="text-slate-700">{item.productName}</span>
                          </div>
                          <span className="text-slate-600 font-medium">
                            {item.lineTotal?.toLocaleString()} RWF
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                  <div className="flex justify-between items-center text-[16px] font-bold text-slate-900 py-4 border-y border-slate-100 mb-5">
                    <span>Total</span>
                    <span>
                      {selectedOrder.orderItems
                        .reduce((sum, i) => sum + (i.lineTotal ?? 0), 0)
                        .toLocaleString()} RWF
                    </span>
                  </div>
                )}

                {/* Batch info */}
                {selectedOrder.batch && (
                  <div className="mb-5 text-[13px] text-slate-500">
                    <span className="font-semibold text-slate-700">Batch: </span>
                    {selectedOrder.batch.slotLabel ?? selectedOrder.batch.id?.slice(0, 8) + "…"}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full text-slate-700 font-semibold border-gray-200">
                      <Mail className="w-4 h-4 mr-2 text-slate-500" />
                      Contact
                    </Button>
                    <Button variant="outline" className="w-full text-slate-700 font-semibold border-gray-200">
                      <RefreshCcw className="w-4 h-4 mr-2 text-slate-500" />
                      Reassign
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 font-semibold">
                    <XOctagon className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
