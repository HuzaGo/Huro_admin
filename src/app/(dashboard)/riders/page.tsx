"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRiders, createRider, updateRiderStatus, clearRiderMessages, fetchRiderVehicles, updateRiderIdentity } from "@/store/slices/riderSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, X, Star, History, Ban, ClipboardList, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RidersPage() {
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'vehicles'>('info');
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [editLicenseId, setEditLicenseId] = useState("");
  const [editNationalId, setEditNationalId] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("MOTORCYCLE");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [nationalId, setNationalId] = useState("");

  const dispatch = useAppDispatch();
  const { riders, totalCount, isFetching, isLoading, error, successMessage, selectedRiderVehicles, isFetchingVehicles } = useAppSelector((state) => state.riders);
  const ridersList = Array.isArray(riders) ? riders : [];

  useEffect(() => {
    dispatch(fetchRiders({ page: 1, limit: 20 }));
    
    return () => {
      dispatch(clearRiderMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedRiderId && activeTab === 'vehicles') {
      dispatch(fetchRiderVehicles(selectedRiderId));
    }
  }, [selectedRiderId, activeTab, dispatch]);

  useEffect(() => {
    if (!isSheetOpen) {
      setTimeout(() => {
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setVehicleType("MOTORCYCLE");
        setVehiclePlate("");
        setLicenseId("");
        setNationalId("");
        dispatch(clearRiderMessages());
      }, 300);
    }
  }, [isSheetOpen, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      fullName,
      email,
      phone,
      password: password || undefined,
      vehicleType,
      vehiclePlate,
      licenseId,
      nationalId,
    };

    const resultAction = await dispatch(createRider(payload));
    
    if (createRider.fulfilled.match(resultAction)) {
      setIsSheetOpen(false);
      dispatch(fetchRiders({ page: 1, limit: 20 }));
    }
  };

  const selectedRider = ridersList.find((r) => r.id === selectedRiderId);
  const isSelected = selectedRider !== undefined;

  // Sync edit state when a rider is selected
  useEffect(() => {
    if (selectedRider) {
      setEditLicenseId(selectedRider.licenseId || "");
      setEditNationalId(selectedRider.nationalId || "");
    }
  }, [selectedRider]);

  const handleStatusToggle = async () => {
    if (!selectedRiderId || !selectedRider) return;
    
    const newStatus = selectedRider.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    await dispatch(updateRiderStatus({ 
      riderId: selectedRiderId, 
      status: newStatus 
    }));
  };

  const handleUpdateIdentity = async () => {
    if (!selectedRiderId) return;
    const resultAction = await dispatch(updateRiderIdentity({
      riderId: selectedRiderId,
      licenseId: editLicenseId,
      nationalId: editNationalId
    }));

    if (updateRiderIdentity.fulfilled.match(resultAction)) {
      setIsEditingIdentity(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-350 mx-auto">
      
      {/* Top Search Bar is part of the layout, we handle the page specific header below */}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Riders</h1>
          <p className="text-[15px] font-medium text-slate-500">
            Real-time monitoring of {totalCount || riders.length} active units.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Button variant="outline" className="text-slate-900 border-slate-200 shadow-sm font-semibold rounded-md px-5 hover:bg-slate-50">
            All Riders
          </Button>
          <Button onClick={() => setIsSheetOpen(true)} className="bg-[#4880FF] hover:bg-[#4880FF]/90 text-white font-semibold rounded-md px-5">
            <Plus className="w-4 h-4 mr-2" /> Add Rider
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Left Side: Table */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          <Card className="shadow-sm border-gray-100 overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 pl-6">RIDER INFO</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14">PHONE</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14">VEHICLE</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 pr-6 text-right">NATIONAL ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetching ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : ridersList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                        No riders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                  ridersList.map((rider) => {
                    const isActiveRow = selectedRiderId === rider.id;
                    return (
                      <TableRow 
                        key={rider.id}
                        onClick={() => setSelectedRiderId(rider.id)}
                        className={`cursor-pointer transition-colors border-b border-slate-100 relative ${isActiveRow ? 'bg-white hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                      >
                        <TableCell className="py-5 pl-6 relative">
                          {isActiveRow && (
                            <div className="absolute left-0 top-0 -bottom-px w-0.75 bg-blue-500 z-10" />
                          )}
                          <div className="flex flex-col leading-tight">
                            <span className="font-bold text-slate-900 text-[15px]">{rider.user?.fullName || 'N/A'}</span>
                            <span className="text-slate-500 text-[13px]">{rider.user?.email || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <span className="font-medium text-slate-700 text-[14px]">
                            {rider.user?.phone || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-slate-900 text-[14px] uppercase">{rider.vehicles?.[0]?.vehicleType || 'N/A'}</span>
                            <span className="text-slate-500 text-[13px]">{rider.vehicles?.[0]?.vehiclePlate || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 pr-6 text-right">
                          <span className="font-bold text-slate-900 text-[14px]">
                            {rider.licenseId || 'N/A'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  }))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Right Side: Rider Details Sidebar */}
        {isSelected && selectedRider && (
          <div className="w-full xl:w-105 shrink-0 animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-sm border-gray-200 sticky top-6 rounded-xl overflow-hidden bg-white">
              
              {/* Header */}
              <div className="p-6 relative border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1.5 wrap-break-word max-w-[85%]">
                  <h2 className="text-[22px] font-bold text-slate-900 leading-tight">
                    {selectedRider.user?.fullName || 'N/A'}
                  </h2>
                  <Badge variant="secondary" className="bg-blue-400 text-white hover:bg-blue-500 border-none font-bold uppercase tracking-wider text-[10px] px-2 py-0.5">
                    {selectedRider.status || 'Active'}
                  </Badge>
                </div>
                <p className="text-[13px] font-medium text-slate-500">{selectedRider.user?.email || 'N/A'}</p>
                <div className="absolute right-4 top-5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                    onClick={() => {
                      setSelectedRiderId(null);
                      setActiveTab('info');
                      setIsEditingIdentity(false);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button 
                  className={`flex-1 py-3 text-[13px] font-semibold tracking-wide uppercase transition-colors ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('info')}
                >
                  INFO
                </button>
                <button 
                  className={`flex-1 py-3 text-[13px] font-semibold tracking-wide uppercase transition-colors ${activeTab === 'vehicles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('vehicles')}
                >
                  VEHICLES
                </button>
              </div>

              {/* Tab Content Section */}
              <div className="p-6">
                {activeTab === 'info' ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Identity Info</span>
                      {!isEditingIdentity ? (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingIdentity(true)} className="h-6 text-[11px] px-2 text-blue-600 hover:bg-blue-50">
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setIsEditingIdentity(false)} className="h-6 text-[11px] px-2 text-slate-500 hover:bg-slate-100">
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleUpdateIdentity} className="h-6 text-[11px] px-2 bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium whitespace-nowrap">National ID</span>
                      {isEditingIdentity ? (
                        <Input value={editNationalId} onChange={(e) => setEditNationalId(e.target.value)} className="h-8 max-w-[180px] text-right" placeholder="119..." />
                      ) : (
                        <span className="text-slate-900 font-bold tracking-wide">{selectedRider.nationalId || 'N/A'}</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium whitespace-nowrap">License ID</span>
                      {isEditingIdentity ? (
                         <Input value={editLicenseId} onChange={(e) => setEditLicenseId(e.target.value)} className="h-8 max-w-[180px] text-right" placeholder="License..." />
                      ) : (
                        <span className="text-slate-900 font-bold tracking-wide">{selectedRider.licenseId || 'N/A'}</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Phone Number</span>
                      <span className="text-slate-900 font-bold tracking-wide">{selectedRider.user?.phone || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Vehicle Plate</span>
                      <Badge className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-md px-2 py-0.5 text-[12px] font-bold">
                        {selectedRider.vehicles?.[0]?.vehiclePlate || 'N/A'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-500 font-medium">Join Date</span>
                      <span className="text-slate-900 font-semibold">{selectedRider.createdAt ? new Date(selectedRider.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {isFetchingVehicles ? (
                       <div className="flex justify-center items-center py-8">
                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                       </div>
                    ) : selectedRiderVehicles && selectedRiderVehicles.length > 0 ? (
                      selectedRiderVehicles.map(vehicle => (
                        <div key={vehicle.id} className="border border-slate-100 rounded-lg p-4 flex justify-between items-center bg-slate-50/50">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-slate-900 uppercase">{vehicle.type}</span>
                            <span className="text-[12px] text-slate-500 font-medium">{vehicle.plate}</span>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <Badge variant="outline" className={`border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${vehicle.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                               {vehicle.isActive ? 'Active' : 'Inactive'}
                             </Badge>
                             <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                               Manage
                             </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                       <div className="text-center py-8 text-slate-500 text-[14px]">
                         No vehicles assigned.
                       </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-6 border-t border-gray-100 flex flex-col gap-3 bg-white">
                <Button className="w-full bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold h-11 rounded-lg">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Assign Batch
                </Button>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <Button variant="outline" className="w-full text-slate-900 font-bold border-gray-200 hover:bg-slate-50 h-11 rounded-lg shadow-sm">
                    <History className="w-4 h-4 mr-2 text-slate-600" />
                    History
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`w-full font-bold h-11 rounded-lg ${selectedRider.status === 'SUSPENDED' ? 'text-green-600 border-green-100 bg-green-50/50 hover:bg-green-50 hover:text-green-700' : 'text-red-600 border-red-100 bg-red-50/50 hover:bg-red-50 hover:text-red-700'}`}
                    onClick={handleStatusToggle}
                    disabled={isLoading}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {selectedRider.status === 'SUSPENDED' ? 'Approve' : 'Suspend'}
                  </Button>
                </div>
              </div>
              
            </Card>
          </div>
        )}

      </div>

      {/* Create Rider Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md px-6" side="right">
          <SheetHeader>
            <SheetTitle>Add New Rider</SheetTitle>
            <SheetDescription>
              Enter the rider's details below to register them in the system.
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250XXXXXXXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for default"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={(val) => setVehicleType(val || "MOTORCYCLE")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                  <SelectItem value="BICYCLE">Bicycle</SelectItem>
                  <SelectItem value="CAR">Car</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiclePlate">Vehicle Plate</Label>
              <Input
                id="vehiclePlate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                placeholder="RAD 123A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseId">License ID</Label>
              <Input
                id="licenseId"
                value={licenseId}
                onChange={(e) => setLicenseId(e.target.value)}
                placeholder="License number..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="119..."
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? "Saving..." : "Save Rider"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
