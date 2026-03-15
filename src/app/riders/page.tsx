"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, X, Star, History, Ban, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock Data
const riders = [
  { 
    id: 1, 
    firstName: "Eric", 
    lastName: "Hoffmann",
    status: "Active",
    batch: "#B-9021", 
    earnings: "$1,240.00",
    phone: "078XXXX",
    motorcycleId: "Moto-992",
    joinDate: "Jan 12, 2023",
    rating: 4.9
  },
  { 
    id: 2, 
    firstName: "Sarah", 
    lastName: "Jenkins",
    status: "Active", 
    batch: "#B-9025", 
    earnings: "$980.50",
    phone: "078XXXX",
    motorcycleId: "Moto-124",
    joinDate: "Mar 05, 2023",
    rating: 4.8
  },
  { 
    id: 3, 
    firstName: "James", 
    lastName: "Wu",
    status: "Offline", 
    batch: "None", 
    earnings: "$540.20",
    phone: "078XXXX",
    motorcycleId: "Moto-455",
    joinDate: "Nov 22, 2022",
    rating: 4.5
  },
  { 
    id: 4, 
    firstName: "Maria", 
    lastName: "Garcia",
    status: "Active", 
    batch: "#B-8998", 
    earnings: "$2,100.00",
    phone: "078XXXX",
    motorcycleId: "Moto-889",
    joinDate: "Aug 14, 2022",
    rating: 5.0
  },
];

export default function RidersPage() {
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(1);

  const selectedRider = riders.find((r) => r.id === selectedRiderId);
  const isSelected = selectedRider !== undefined;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      
      {/* Top Search Bar is part of the layout, we handle the page specific header below */}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Riders</h1>
          <p className="text-[15px] font-medium text-slate-500">
            Real-time monitoring of 1,240 active units.
          </p>
        </div>
        <div className="mb-1 md:mb-0">
          <Button variant="outline" className="text-slate-900 border-slate-200 shadow-sm font-semibold rounded-md px-5 hover:bg-slate-50">
            All Riders
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
                    <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 pl-6">RIDER NAME</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14">STATUS</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14">CURRENT BATCH</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 pr-6 text-right">EARNINGS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riders.map((rider) => {
                    const isActiveRow = selectedRiderId === rider.id;
                    return (
                      <TableRow 
                        key={rider.id}
                        onClick={() => setSelectedRiderId(rider.id)}
                        className={`cursor-pointer transition-colors border-b border-slate-100 relative ${isActiveRow ? 'bg-white hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                      >
                        <TableCell className="py-5 pl-6 relative">
                          {isActiveRow && (
                            <div className="absolute left-0 top-0 bottom-[-1px] w-[3px] bg-blue-500 z-10" />
                          )}
                          <div className="flex flex-col leading-tight">
                            <span className="font-bold text-slate-900 text-[15px]">{rider.firstName}</span>
                            <span className="font-bold text-slate-900 text-[15px]">{rider.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          {rider.status === "Active" ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100/80 border-none font-semibold px-2.5">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200/80 border-none font-semibold px-2.5">
                              Offline
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-5">
                          <span className={`text-[14px] font-medium ${rider.batch === 'None' ? 'text-slate-400' : 'text-slate-600'}`}>
                            {rider.batch}
                          </span>
                        </TableCell>
                        <TableCell className="py-5 pr-6 text-right">
                          <span className="font-bold text-slate-900 text-[15px]">
                            {rider.earnings}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Right Side: Rider Details Sidebar */}
        {isSelected && selectedRider && (
          <div className="w-full xl:w-[420px] flex-shrink-0 animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-sm border-gray-200 sticky top-6 rounded-xl overflow-hidden bg-white">
              
              {/* Header */}
              <div className="p-6 relative border-b border-gray-100">
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-[22px] font-bold text-slate-900">
                    {selectedRider.firstName}
                  </h2>
                  <Badge variant="secondary" className="bg-blue-400 text-white hover:bg-blue-500 border-none font-bold uppercase tracking-wider text-[10px] px-2 py-0.5">
                    {selectedRider.status}
                  </Badge>
                </div>
                <p className="text-[13px] font-medium text-slate-500">Full-time Delivery Partner</p>
                <div className="absolute right-4 top-5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                    onClick={() => setSelectedRiderId(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Info Section */}
              <div className="p-6">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">
                  INFORMATION
                </h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-500 font-medium">Phone Number</span>
                    <span className="text-slate-900 font-bold tracking-wide">{selectedRider.phone}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-500 font-medium">Motorcycle ID</span>
                    <Badge className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-md px-2 py-0.5 text-[12px] font-bold">
                      {selectedRider.motorcycleId}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-500 font-medium">Join Date</span>
                    <span className="text-slate-900 font-semibold">{selectedRider.joinDate}</span>
                  </div>

                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-500 font-medium">Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-900 font-bold">{selectedRider.rating.toFixed(1)}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mb-0.5" />
                    </div>
                  </div>
                </div>
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
                  <Button variant="outline" className="w-full text-red-600 font-bold border-red-100 bg-red-50/50 hover:bg-red-50 hover:text-red-700 h-11 rounded-lg">
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend
                  </Button>
                </div>
              </div>
              
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
