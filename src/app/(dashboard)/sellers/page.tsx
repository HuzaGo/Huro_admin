"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Store, X, MapPin, User, ExternalLink, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSellers, createSeller, clearSellerMessages } from "@/store/slices/sellerSlice";

// Mock data based on the provided screenshot
const sellers = [
  {
    id: "seller-1",
    name: "Nyabugogo Snacks",
    description: "Handcrafted traditional snacks",
    category: "Food & Beverage",
    products: 42,
    ordersToday: 15,
    status: "ACTIVE",
    owner: "Jean-Paul Mugisha",
    location: "Kigali, Nyarugenge",
    inventory: [
      { id: 101, name: "Chili Spiced Peanuts", price: "1,200 RWF", stock: "IN STOCK", stockStatus: "success" },
      { id: 102, name: "Sweet Plantain Chips", price: "800 RWF", stock: "IN STOCK", stockStatus: "success" },
      { id: 103, name: "Mandazi (3pcs)", price: "500 RWF", stock: "LOW", stockStatus: "warning" },
      { id: 104, name: "Spicy Ginger Tea", price: "1,500 RWF", stock: "SOLD OUT", stockStatus: "destructive" },
    ]
  },
  {
    id: "seller-2",
    name: "Print Hub",
    description: "Professional printing services",
    category: "Services",
    products: 128,
    ordersToday: 8,
    status: "ACTIVE",
    owner: "Alice Umuhoza",
    location: "Kigali, Gasabo",
    inventory: [
      { id: 201, name: "A4 Color Print (100 pages)", price: "5,000 RWF", stock: "IN STOCK", stockStatus: "success" },
      { id: 202, name: "Business Cards (50 pcs)", price: "15,000 RWF", stock: "IN STOCK", stockStatus: "success" },
      { id: 203, name: "Roll-up Banner", price: "45,000 RWF", stock: "LOW", stockStatus: "warning" },
    ]
  }
];

export default function SellersPage() {
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocationName, setPickupLocationName] = useState("");
  const [pickupLocationNote, setPickupLocationNote] = useState("");
  const [pickupLocationUrl, setPickupLocationUrl] = useState("");
  const [pickupLatitude, setPickupLatitude] = useState("");
  const [pickupLongitude, setPickupLongitude] = useState("");

  const dispatch = useAppDispatch();
  const { sellers: sellersList, isFetching, isLoading, error, successMessage } = useAppSelector((state) => state.sellers);

  useEffect(() => {
    dispatch(fetchSellers({ page: 1, limit: 20 }));
    return () => { dispatch(clearSellerMessages()); };
  }, [dispatch]);

  useEffect(() => {
    if (!isSheetOpen) {
      setTimeout(() => {
        setName("");
        setDescription("");
        setLogoUrl("");
        setPhone("");
        setPickupLocationName("");
        setPickupLocationNote("");
        setPickupLocationUrl("");
        setPickupLatitude("");
        setPickupLongitude("");
        dispatch(clearSellerMessages());
      }, 300);
    }
  }, [isSheetOpen, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      sellerName: name,
      description,
      logoUrl,
      phone,
      pickupLocationName,
      pickupLocationNote,
      pickupLocationUrl,
      pickupLatitude: parseFloat(pickupLatitude) || 0,
      pickupLongitude: parseFloat(pickupLongitude) || 0,
    };

    const resultAction = await dispatch(createSeller(payload));
    if (createSeller.fulfilled.match(resultAction)) {
      setIsSheetOpen(false);
      dispatch(fetchSellers({ page: 1, limit: 20 }));
    }
  };

  const selectedSeller = sellersList.find(s => s.id === selectedSellerId); // fallback for API seller
  const selectedMockSeller = sellers.find(s => s.id === selectedSellerId); // fallback for mock details in the UI

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedSellerId ? 'pr-0' : ''}`}>
        <div className="p-6 flex-1 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sellers Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and monitor all platform vendors and their performance.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search sellers, products, or locations..."
                  className="pl-9 bg-white"
                />
              </div>
              <Button onClick={() => setIsSheetOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Seller
              </Button>
            </div>
          </div>

          {/* Table Card */}
          <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="font-semibold text-gray-500">Seller</TableHead>
                  <TableHead className="font-semibold text-gray-500">Category</TableHead>
                  <TableHead className="font-semibold text-gray-500 text-center">Products</TableHead>
                  <TableHead className="font-semibold text-gray-500 text-center">Orders Today</TableHead>
                  <TableHead className="font-semibold text-gray-500 text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sellersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No sellers found.
                    </TableCell>
                  </TableRow>
                ) : sellersList.map((seller) => (
                  <TableRow 
                    key={seller.id}
                    onClick={() => setSelectedSellerId(seller.id === selectedSellerId ? null : seller.id)}
                    className={`cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${
                      selectedSellerId === seller.id ? 'bg-blue-50/50 relative' : ''
                    }`}
                  >
                    <TableCell className="py-4 relative">
                      {selectedSellerId === seller.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                      )}
                      <div className="font-medium text-gray-900">{seller.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 font-normal">
                        {'Category'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-gray-600">
                      {0}
                    </TableCell>
                    <TableCell className="text-center font-medium text-gray-600">
                      {0}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${seller.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={`text-sm font-medium ${seller.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>
                          {seller.status || 'ACTIVE'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      {/* Details Side Panel - Slides in directly from the side without dark mode styling */}
      {selectedSellerId && selectedSeller && (
        <div className="w-100 border-l border-gray-200 bg-white shadow-xl flex flex-col animate-in slide-in-from-right-8 fade-in duration-300 z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Seller Details</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-500 hover:bg-gray-100"
              onClick={() => setSelectedSellerId(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Seller Profile */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-50 p-4 rounded-xl mb-4">
                <Store className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{selectedSeller.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedSeller.description}</p>
            </div>

            {/* Quick Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <User className="h-4 w-4" /> Owner
                </span>
                <span className="font-medium text-gray-900">{selectedMockSeller?.owner || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </span>
                <span className="font-medium text-blue-600">{selectedSeller.pickupLocationName || selectedMockSeller?.location || 'N/A'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-col">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                Deactivate
              </Button>
            </div>

            <Separator className="bg-gray-100" />

            {/* Product Inventory */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Product Inventory</h4>
              <div className="space-y-3">
                {(selectedMockSeller?.inventory || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-blue-600 font-semibold">{item.price}</p>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className={`
                      text-[10px] font-semibold tracking-wider
                      ${item.stockStatus === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      ${item.stockStatus === 'warning' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : ''}
                      ${item.stockStatus === 'destructive' ? 'bg-gray-100 text-gray-600 hover:bg-gray-100' : ''}
                    `}>
                      {item.stock}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
            <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Merchant Profile
            </Button>
          </div>
        </div>
      )}

      {/* Add Seller Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md px-6" side="right">
          <SheetHeader>
            <SheetTitle>Add New Seller</SheetTitle>
            <SheetDescription>
              Register a new seller by filling out the basic profile and pickup information below.
            </SheetDescription>
          </SheetHeader>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mt-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 pb-10">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Main Canteen"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of the seller"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250788000000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupLocationName">Pickup Location Name</Label>
              <Input
                id="pickupLocationName"
                value={pickupLocationName}
                onChange={(e) => setPickupLocationName(e.target.value)}
                placeholder="E.g., KG 11 Ave"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupLocationNote">Pickup Location Note</Label>
              <Input
                id="pickupLocationNote"
                value={pickupLocationNote}
                onChange={(e) => setPickupLocationNote(e.target.value)}
                placeholder="Near the main gate..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupLocationUrl">Pickup Location Map URL</Label>
              <Input
                id="pickupLocationUrl"
                value={pickupLocationUrl}
                onChange={(e) => setPickupLocationUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="pickupLatitude">Latitude</Label>
                <Input
                  id="pickupLatitude"
                  type="number"
                  step="any"
                  value={pickupLatitude}
                  onChange={(e) => setPickupLatitude(e.target.value)}
                  placeholder="-1.95"
                  required
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="pickupLongitude">Longitude</Label>
                <Input
                  id="pickupLongitude"
                  type="number"
                  step="any"
                  value={pickupLongitude}
                  onChange={(e) => setPickupLongitude(e.target.value)}
                  placeholder="30.06"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6" disabled={isLoading}>
              {isLoading ? "Creating..." : "Save Seller"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
