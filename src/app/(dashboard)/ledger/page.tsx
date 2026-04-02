"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLedger, LedgerStatus } from "@/store/slices/ledgerSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const STATUS_COLORS: Record<LedgerStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PAID: "bg-green-50 text-green-700",
};

export default function LedgerPage() {
  const dispatch = useAppDispatch();
  const { entries, isFetching, error, total, currentPage, totalPages } =
    useAppSelector((s) => s.ledger);

  const [filterStatus, setFilterStatus] = useState<LedgerStatus | "">("");
  const [sellerIdInput, setSellerIdInput] = useState("");
  const [sellerIdFilter, setSellerIdFilter] = useState("");

  const load = (page = 1) => {
    dispatch(fetchLedger({
      page,
      limit: 20,
      ...(filterStatus && { status: filterStatus }),
      ...(sellerIdFilter.trim() && { sellerId: sellerIdFilter.trim() }),
    }));
  };

  useEffect(() => { load(1); }, [filterStatus, sellerIdFilter]);

  const applySellerFilter = () => setSellerIdFilter(sellerIdInput);
  const clearSellerFilter = () => { setSellerIdInput(""); setSellerIdFilter(""); };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const formatAmount = (n: number) =>
    Number(n).toLocaleString(undefined, { minimumFractionDigits: 0 }) + " RWF";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
        <p className="text-sm text-gray-500 mt-1">
          Seller earnings — tracked from DELIVERED orders, marked PAID by admin.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={filterStatus || "ALL"}
          onValueChange={(v) => setFilterStatus(v === "ALL" ? "" : v as LedgerStatus)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            placeholder="Filter by Seller ID…"
            value={sellerIdInput}
            onChange={(e) => setSellerIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySellerFilter()}
            className="w-56"
          />
          <Button variant="outline" onClick={applySellerFilter}>Apply</Button>
          {sellerIdFilter && (
            <Button variant="ghost" onClick={clearSellerFilter}>Clear</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">{error}</div>
      )}

      {isFetching ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <BookOpen className="h-10 w-10" />
          <p className="text-sm">No ledger entries found.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Seller</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900 text-sm">
                        {entry.seller?.businessName ||
                          entry.seller?.user?.fullName ||
                          entry.seller?.user?.email ||
                          entry.sellerId}
                      </div>
                      {entry.seller?.user?.email && entry.seller?.businessName && (
                        <div className="text-xs text-gray-400">{entry.seller.user.email}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 font-mono">
                      {entry.order?.orderNumber || entry.orderId.slice(0, 8) + "…"}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {formatAmount(entry.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={STATUS_COLORS[entry.status]}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{total} entr{total !== 1 ? "ies" : "y"}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => load(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>{currentPage} / {totalPages}</span>
                <Button
                  variant="outline" size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => load(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
