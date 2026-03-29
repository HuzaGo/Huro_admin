"use client";

import { useEffect, useState } from "react";
import { Tag, ChevronLeft, ChevronRight, Search, Eye, ShieldCheck, ShieldX } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchListings,
  moderateListing,
  clearModerateMessages,
  ListingCondition,
  ModerationAction,
  MarketplaceListing,
} from "@/store/slices/marketplaceSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const CONDITION_LABELS: Record<ListingCondition, string> = {
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  FOR_PARTS: "For Parts",
};

const CONDITION_COLORS: Record<ListingCondition, string> = {
  LIKE_NEW: "bg-green-50 text-green-700",
  GOOD: "bg-blue-50 text-blue-700",
  FAIR: "bg-yellow-50 text-yellow-700",
  FOR_PARTS: "bg-red-50 text-red-700",
};

const PAGE_LIMIT = 20;

export default function UsedListingsPage() {
  const dispatch = useAppDispatch();
  const { listings, isFetching, error, total, currentPage, totalPages, isModerating, moderateError, moderateSuccess } =
    useAppSelector((s) => s.marketplace);

  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState<ListingCondition | "">("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Moderation dialog state
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [moderateAction, setModerateAction] = useState<ModerationAction>("REMOVE");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(
      fetchListings({
        page: 1,
        limit: PAGE_LIMIT,
        condition: condition || undefined,
        search: debouncedSearch || undefined,
      })
    );
  }, [dispatch, condition, debouncedSearch]);

  // Close dialog on success
  useEffect(() => {
    if (moderateSuccess) {
      const timer = setTimeout(() => {
        setSelectedListing(null);
        dispatch(clearModerateMessages());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [moderateSuccess, dispatch]);

  const goToPage = (page: number) => {
    dispatch(
      fetchListings({
        page,
        limit: PAGE_LIMIT,
        condition: condition || undefined,
        search: debouncedSearch || undefined,
      })
    );
  };

  const openModerate = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setModerateAction("REMOVE");
    setReason("");
    dispatch(clearModerateMessages());
  };

  const handleModerate = async () => {
    if (!selectedListing) return;
    dispatch(
      moderateListing({
        listingId: selectedListing.id,
        action: moderateAction,
        reason: reason.trim() || undefined,
      })
    );
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  const formatPrice = (price: string | number) =>
    new Intl.NumberFormat("en-RW", { style: "decimal" }).format(Number(price)) + " RWF";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Used Listings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse and moderate second-hand listings from users.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={condition || "ALL"}
          onValueChange={(v) =>
            setCondition(v === "ALL" ? "" : (v as ListingCondition))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Conditions</SelectItem>
            <SelectItem value="LIKE_NEW">Like New</SelectItem>
            <SelectItem value="GOOD">Good</SelectItem>
            <SelectItem value="FAIR">Fair</SelectItem>
            <SelectItem value="FOR_PARTS">For Parts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {isFetching ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Tag className="h-10 w-10" />
          <p className="text-sm">No listings found.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Asking Price</TableHead>
                  <TableHead>Negotiable</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Listed</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900 max-w-50 truncate">
                        {listing.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {listing.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {listing.seller?.fullName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={CONDITION_COLORS[listing.condition] ?? ""}
                      >
                        {CONDITION_LABELS[listing.condition] ?? listing.condition}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(listing.askingPrice)}
                    </TableCell>
                    <TableCell>
                      {listing.isNegotiable ? (
                        <span className="text-xs text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="h-3.5 w-3.5" />
                        {listing.viewCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(listing.expiresAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(listing.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => openModerate(listing)}
                      >
                        Moderate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {total} listing{total !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Moderation Sheet */}
      <Sheet
        open={!!selectedListing}
        onOpenChange={(open) => {
          if (!open && !isModerating) {
            setSelectedListing(null);
            dispatch(clearModerateMessages());
          }
        }}
      >
        <SheetContent className="sm:max-w-md w-full overflow-y-auto px-6 py-8">
          <SheetHeader>
            <SheetTitle>Moderate Listing</SheetTitle>
            <SheetDescription>{selectedListing?.title}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {moderateError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {moderateError}
              </div>
            )}
            {moderateSuccess && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {moderateSuccess}
              </div>
            )}

            <div className="space-y-2">
              <Label>Action</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModerateAction("APPROVE")}
                  disabled={isModerating}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    moderateAction === "APPROVE"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setModerateAction("REMOVE")}
                  disabled={isModerating}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    moderateAction === "REMOVE"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <ShieldX className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moderate-reason">
                Reason <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="moderate-reason"
                placeholder="e.g. Violates community guidelines"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isModerating}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedListing(null);
                  dispatch(clearModerateMessages());
                }}
                disabled={isModerating}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 ${
                  moderateAction === "REMOVE"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                onClick={handleModerate}
                disabled={isModerating || !!moderateSuccess}
              >
                {isModerating
                  ? "Submitting..."
                  : moderateAction === "REMOVE"
                  ? "Remove Listing"
                  : "Approve Listing"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
