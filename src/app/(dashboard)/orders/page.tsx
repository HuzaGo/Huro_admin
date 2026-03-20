"use client";

import { useState } from "react";
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
import {
  Search,
  Download,
  Plus,
  MapPin,
  Mail,
  RefreshCcw,
  XOctagon,
  User
} from "lucide-react";

// Mock Data
const orders = [
  { id: "#ORD-9012", source: "Shopify Store", customer: "Jane Smith", batch: "B-2024-03A", status: "Processing" },
  { id: "#ORD-9011", source: "Mobile App", customer: "Michael Chen", batch: "B-2024-03A", status: "Pending" },
  { id: "#ORD-9010", source: "Amazon Marketplace", customer: "Sarah Davis", batch: "B-2024-02B", status: "Shipped" },
  { id: "#ORD-9009", source: "Direct Sales", customer: "Robert White", batch: "B-2024-02B", status: "Cancelled" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Processing":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Processing</Badge>;
    case "Pending":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Pending</Badge>;
    case "Shipped":
      return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Shipped</Badge>;
    case "Cancelled":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Find the selected order object to populate the details pane dynamically using mock data if needed,
  // right now we just show/hide the panel based on whether anything is selected.
  const isOrderSelected = selectedOrder !== null;

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
        <div className="flex items-center gap-3">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
          <Button variant="outline" className="bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Left Side: Table & Filters */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          
          {/* Filters Card */}
          <Card className="shadow-sm border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Order ID</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="orders-search" placeholder="e.g. #1203" className="pl-9 bg-slate-50 border-gray-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Date Range</label>
                <Select defaultValue="today">
                  <SelectTrigger className="bg-slate-50 border-gray-200">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Order Type</label>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-slate-50 border-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Status</label>
                <Select defaultValue="all">
                  <SelectTrigger className="bg-slate-50 border-gray-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">ORDER ID</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">SOURCE</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">CUSTOMER</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">BATCH</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider h-12">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order.id}
                      onClick={() => setSelectedOrder(order.id)}
                      className={`cursor-pointer transition-colors border-b border-slate-50 hover:bg-slate-50 ${selectedOrder === order.id ? 'bg-blue-50/40 hover:bg-blue-50/60' : ''}`}
                    >
                      <TableCell className="font-bold text-blue-600 py-4 max-w-30">{order.id}</TableCell>
                      <TableCell className="text-slate-600 font-medium py-4">{order.source}</TableCell>
                      <TableCell className="text-slate-900 font-bold py-4">{order.customer}</TableCell>
                      <TableCell className="text-slate-600 py-4 font-medium">{order.batch}</TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(order.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white mt-auto">
              <p className="text-sm font-medium text-slate-500">
                Showing 10 of 428 orders
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-slate-600 font-medium">Previous</Button>
                <Button variant="outline" size="sm" className="text-slate-600 font-medium">Next</Button>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Side: Order Details Sidebar */}
        {isOrderSelected && (
          <div className="w-full xl:w-95 shrink-0 animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-sm border-gray-100 sticky top-6">
              <CardHeader className="pb-4 pt-6 px-6 relative">
                <CardTitle className="text-xl font-bold text-slate-900">Order Details</CardTitle>
                <div className="absolute right-4 top-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <XOctagon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                
                {/* Customer Info */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <h3 className="font-bold text-slate-900 text-[16px]">Michael Chen</h3>
                  <span className="text-[14px] text-slate-500 font-medium mb-1">michael.c@example.com</span>
                  <div className="flex items-center text-[13px] text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    Kigali
                  </div>
                </div>
              </div>

              {/* Product List */}
              <div className="mb-6">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Product List</h4>
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start text-[14px]">
                    <div className="flex gap-2 font-medium">
                      <span className="text-blue-600 font-bold">2x</span>
                      <span className="text-slate-700">Snack Mix (Large)</span>
                    </div>
                    <span className="text-slate-600 font-medium">3,000 RWF</span>
                  </div>
                  
                  <div className="flex justify-between items-start text-[14px]">
                    <div className="flex gap-2 font-medium">
                      <span className="text-blue-600 font-bold">1x</span>
                      <span className="text-slate-700">Bottled Water (500ml)</span>
                    </div>
                    <span className="text-slate-600 font-medium">500 RWF</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-3 py-5 border-y border-slate-100 mb-6">
                <div className="flex justify-between items-center text-[14px] font-medium text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-blue-600 font-bold">4,500 RWF</span>
                </div>
                <div className="flex justify-between items-center text-[14px] font-medium text-slate-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-[18px] font-bold text-slate-900 mb-8">
                <span>Total</span>
                <span>$245.00</span>
              </div>

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
                <Button variant="outline" className="w-full text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 font-semibold mt-1">
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
