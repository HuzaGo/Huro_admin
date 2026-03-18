"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { XOctagon, Plus, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createBatch, clearBatchMessages } from "@/store/slices/batchSlice";
import { fetchRiders } from "@/store/slices/riderSlice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock Delivery Zones Data
const DELIVERY_ZONES = [
  { id: "zone-1", name: "Zone A - UR CST Main Gate" },
  { id: "zone-2", name: "Zone B - Kicukiro" },
  { id: "zone-3", name: "Zone C - Remera" },
  { id: "zone-4", name: "Zone D - Nyarugenge" },
];

// Mock Data
const batches = [
  { 
    id: "B12", 
    orders: 12, 
    stops: 4, 
    rider: "Eric", 
    location: "UR CST Main Gate", 
    status: "PICKING UP",
    statusColor: "bg-blue-100 text-blue-700" 
  },
  { 
    id: "B13", 
    orders: 9,
    stops: 3, 
    rider: "John", 
    location: "UR CST Main Gate", 
    status: "PENDING",
    statusColor: "bg-orange-100 text-orange-700"
  },
];

export default function BatchesPage() {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    slotLabel: "",
    scheduledAt: "",
    cutoffAt: "",
    maxOrders: 15,
    deliveryZoneId: "",
    riderId: ""
  });

  const dispatch = useAppDispatch();
  const { isCreating, error, successMessage } = useAppSelector((state) => state.batches);
  const { riders } = useAppSelector((state) => state.riders);

  useEffect(() => {
    dispatch(fetchRiders({ limit: 100 })); // Fetch riders to populate the dropdown
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setIsCreateModalOpen(false);
      setFormData({
        slotLabel: "",
        scheduledAt: "",
        cutoffAt: "",
        maxOrders: 15,
        deliveryZoneId: "",
        riderId: ""
      });
      // Optional: fetch batches again here if fetchBatches is implemented
      const timer = setTimeout(() => {
        dispatch(clearBatchMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'maxOrders' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createBatch({
      ...formData,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      cutoffAt: new Date(formData.cutoffAt).toISOString(),
    }));
  };

  const isBatchSelected = selectedBatch !== null;

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
            onClick={() => setIsCreateModalOpen(true)}
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
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14">VOLUME</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14">RIDER</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14">LOCATION</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14">STATUS</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] tracking-wider h-14 pr-6">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow 
                      key={batch.id}
                      onClick={() => setSelectedBatch(batch.id)}
                      className={`cursor-pointer transition-colors border-b border-slate-100 ${selectedBatch === batch.id ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'bg-white hover:bg-slate-50'}`}
                    >
                      <TableCell className="font-bold text-blue-600 py-5 pl-6 text-base">{batch.id}</TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-[14px]">{batch.orders} Orders</span>
                          <span className="text-slate-500 text-[13px]">{batch.stops} Pickup Stops</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium py-5 text-[14px]">{batch.rider}</TableCell>
                      <TableCell className="text-slate-500 py-5 text-[14px]">
                        <div className="max-w-25 leading-tight">
                          {batch.location}
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge variant="secondary" className={`${batch.statusColor} border-none font-bold text-[10px] tracking-wider`}>
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5 pr-6">
                        <Button variant="link" className="text-blue-600 font-bold text-[13px] p-0 h-auto">
                          View Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Right Side: Batch Details Sidebar */}
        {isBatchSelected && (
          <div className="w-full xl:w-105 shrink-0 animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-sm border-gray-100 sticky top-6 rounded-xl overflow-hidden">
              <CardHeader className="pb-4 pt-6 px-6 relative border-b border-slate-50">
                <CardTitle className="text-[20px] font-bold text-slate-900 mb-1">Batch {selectedBatch}</CardTitle>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-green-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Active
                </div>
                <div className="absolute right-4 top-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                    onClick={() => setSelectedBatch(null)}
                  >
                    <XOctagon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 py-6 border-b border-slate-50 bg-slate-50/30">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-100/80 rounded-xl p-4 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ORDERS</span>
                    <span className="text-2xl font-bold text-slate-900">12</span>
                  </div>
                  <div className="bg-slate-100/80 rounded-xl p-4 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">PICKUP TIME</span>
                    <span className="text-2xl font-bold text-red-500">11:30</span>
                  </div>
                </div>
              </CardContent>

              <CardContent className="px-6 py-6 pb-2">
                <h4 className="text-[12px] font-bold text-slate-500 tracking-wider flex items-center gap-2 mb-6">
                  <span className="text-slate-400 font-normal">⮂</span> 4 PICKUP STOPS
                </h4>
                
                {/* Timeline */}
                <div className="relative pl-3 space-y-7 before:absolute before:inset-y-2 before:left-6.75 before:w-0.5 before:bg-slate-200">
                  
                  {/* Stop 1 */}
                  <div className="relative z-10 flex gap-4 items-start">
                    <div className="w-7.5 h-7.5 rounded-full bg-white border-2 border-blue-500 text-blue-600 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                      01
                    </div>
                    <div className="flex flex-col pt-1 pl-1">
                      <h3 className="font-bold text-slate-900 text-[14px]">Snack Shop</h3>
                      <p className="text-[13px] text-slate-500">3 Orders waiting</p>
                    </div>
                  </div>

                  {/* Stop 2 */}
                  <div className="relative z-10 flex gap-4 items-start">
                    <div className="w-7.5 h-7.5 rounded-full bg-white border-2 border-slate-700 text-slate-700 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                      02
                    </div>
                    <div className="flex flex-col pt-1 pl-1">
                      <h3 className="font-bold text-slate-900 text-[14px]">Printing Shop</h3>
                      <p className="text-[13px] text-slate-500">5 Orders waiting</p>
                    </div>
                  </div>

                  {/* Stop 3 */}
                  <div className="relative z-10 flex gap-4 items-start">
                    <div className="w-7.5 h-7.5 rounded-full bg-white border-2 border-slate-700 text-slate-700 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                      03
                    </div>
                    <div className="flex flex-col pt-1 pl-1">
                      <h3 className="font-bold text-slate-900 text-[14px]">Electronics Shop</h3>
                      <p className="text-[13px] text-slate-500">2 Orders waiting</p>
                    </div>
                  </div>

                  {/* Stop 4 */}
                  <div className="relative z-10 flex gap-4 items-start">
                    <div className="w-7.5 h-7.5 rounded-full bg-white border-2 border-slate-700 text-slate-700 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                      04
                    </div>
                    <div className="flex flex-col pt-1 pl-1">
                      <h3 className="font-bold text-slate-900 text-[14px]">Printing Hub</h3>
                      <p className="text-[13px] text-slate-500">2 Orders waiting</p>
                    </div>
                  </div>

                </div>
              </CardContent>

              <CardContent className="px-6 py-6 pb-6">
                {/* Assigned Rider */}
                <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Eric" />
                    <AvatarFallback>EP</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-slate-500">Assigned Rider</span>
                    <span className="text-[14px] font-bold text-slate-900">Eric S. Peterson</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      Assign Rider
                    </Button>
                    <Button className="w-full bg-[#00A36C] hover:bg-[#008A5B] text-white font-semibold">
                      Dispatch Batch
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 font-semibold h-11">
                    Cancel Batch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>

      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md bg-white shadow-xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-xl">Create New Batch</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  dispatch(clearBatchMessages());
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-4 pt-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-200">
                    {successMessage}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="slotLabel">Slot Label (e.g. 12:00 - 12:30)</Label>
                  <Input
                    id="slotLabel"
                    name="slotLabel"
                    value={formData.slotLabel}
                    onChange={handleInputChange}
                    placeholder="12:00 - 12:30"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="scheduledAt">Scheduled At</Label>
                    <Input
                      id="scheduledAt"
                      name="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cutoffAt">Cutoff At</Label>
                    <Input
                      id="cutoffAt"
                      name="cutoffAt"
                      type="datetime-local"
                      value={formData.cutoffAt}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxOrders">Max Orders</Label>
                  <Input
                    id="maxOrders"
                    name="maxOrders"
                    type="number"
                    min="1"
                    value={formData.maxOrders}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deliveryZoneId">Delivery Zone</Label>
                  <Select
                    value={formData.deliveryZoneId}
                    onValueChange={(value) => handleSelectChange('deliveryZoneId', value as string)}
                    required
                  >
                    <SelectTrigger id="deliveryZoneId">
                      <SelectValue placeholder="Select Delivery Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_ZONES.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="riderId">Assigned Rider</Label>
                  <Select
                    value={formData.riderId}
                    onValueChange={(value) => handleSelectChange('riderId', value as string)}
                    required
                  >
                    <SelectTrigger id="riderId">
                      <SelectValue placeholder="Select Rider" />
                    </SelectTrigger>
                    <SelectContent>
                      {riders.map((rider) => (
                        <SelectItem key={rider.id} value={rider.id}>
                          {rider.fullName}
                        </SelectItem>
                      ))}
                      {riders.length === 0 && (
                        <SelectItem value="no-rider" disabled>No riders available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Batch'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
