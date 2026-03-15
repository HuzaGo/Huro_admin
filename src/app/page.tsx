import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XOctagon, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  Ban
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="shadow-xs border-gray-100 rounded-xl">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Orders Today</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 flex flex-col gap-1">
            <div className="text-3xl font-extrabold text-slate-900">1,284</div>
            <p className="text-[13px] text-gray-400 font-medium">vs. last 24h</p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="shadow-xs border-gray-100 rounded-xl">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Riders</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 flex flex-col gap-1">
            <div className="text-3xl font-extrabold text-slate-900">156</div>
            <p className="text-[13px] text-gray-400 font-medium">Currently online</p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="shadow-xs border-gray-100 rounded-xl">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Orders Waiting Pickup</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 flex flex-col gap-1">
            <div className="text-3xl font-extrabold text-slate-900">450</div>
            <p className="text-[13px] text-gray-400 font-medium">Daily gross</p>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="shadow-xs border-gray-100 rounded-xl">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Orders</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 flex flex-col gap-1">
            <div className="text-3xl font-extrabold text-slate-900">3</div>
            <p className="text-[13px] text-gray-400 font-medium">2 Picking Up • 1 Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Timeline Section */}
      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-[18px] font-bold text-slate-900">Orders Timeline</h2>
          <a href="#" className="text-[13px] font-semibold text-blue-500 hover:text-blue-600">View All Activities</a>
        </div>
        
        <div className="p-6 pt-4 relative">
          <div className="absolute top-4 bottom-8 left-[38px] w-[2px] bg-slate-100"></div>
          
          <div className="space-y-6">
            {/* Timeline Item 1 */}
            <div className="flex gap-4 relative z-10 w-full group">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-500 shadow-sm ring-4 ring-white mt-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col pt-1.5 pb-2">
                <h3 className="text-[14px] font-bold text-slate-900">Order #4592 Picked Up</h3>
                <p className="text-[13px] text-slate-500 mt-1 mb-1">Rider Jason Statham reached the warehouse and picked up the shipment.</p>
                <span className="text-[12px] text-slate-400 font-medium">2 mins ago</span>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex gap-4 relative z-10 w-full group">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-500 shadow-sm ring-4 ring-white mt-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col pt-1.5 pb-2">
                <h3 className="text-[14px] font-bold text-slate-900">Order #4591 Delivered</h3>
                <p className="text-[13px] text-slate-500 mt-1 mb-1">Shipment successfully delivered to 442 Baker Street.</p>
                <span className="text-[12px] text-slate-400 font-medium">15 mins ago</span>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="flex gap-4 relative z-10 w-full group">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 shadow-sm ring-4 ring-white mt-1">
                <XOctagon className="w-4 h-4" />
              </div>
              <div className="flex flex-col pt-1.5 pb-2">
                <h3 className="text-[14px] font-bold text-slate-900">Order #4593 Cancelled</h3>
                <p className="text-[13px] text-slate-500 mt-1 mb-1">User cancelled the order before rider arrival.</p>
                <span className="text-[12px] text-slate-400 font-medium">34 mins ago</span>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="flex gap-4 relative z-10 w-full group">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-yellow-50 text-yellow-500 shadow-sm ring-4 ring-white mt-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col pt-1.5 pb-2">
                <h3 className="text-[14px] font-bold text-slate-900">Order #4590 Delayed</h3>
                <p className="text-[13px] text-slate-500 mt-1 mb-1">Potential traffic delay detected for route Zone B.</p>
                <span className="text-[12px] text-slate-400 font-medium">45 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Alerts & Issues */}
      <Card className="shadow-sm border-red-50 rounded-xl overflow-hidden mb-8">
         <div className="p-5 border-b border-gray-50 bg-red-50/30">
          <h2 className="flex items-center gap-2 text-[16px] font-bold text-slate-900">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            System Alerts & Issues
          </h2>
        </div>
        
        <div className="flex flex-col divide-y divide-gray-50">
          
          {/* Alert 1 */}
          <div className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors bg-white">
            <div className="flex gap-4 items-center">
              <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-500 border border-orange-100/50">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[14px] font-bold text-slate-900">Order #1202 delayed</h3>
                <p className="text-[13px] text-slate-500">Rider stuck in traffic • Est. +15 mins</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-none rounded-md px-3 py-1.5 text-[11px] font-bold cursor-default tracking-wider uppercase">
              WARNING
            </Badge>
          </div>

          {/* Alert 2 */}
          <div className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors bg-white">
            <div className="flex gap-4 items-center">
              <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500 border border-red-100/50">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[14px] font-bold text-slate-900">Listing #442 reported</h3>
                <p className="text-[13px] text-slate-500">Reason: Counterfeit product report</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-600 border-none rounded-md px-3 py-1.5 text-[11px] font-bold cursor-default tracking-wider uppercase">
              ERROR
            </Badge>
          </div>

          {/* Alert 3 */}
          <div className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors bg-white">
            <div className="flex gap-4 items-center">
              <div className="flex-none flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500 border border-red-100/50">
                <Ban className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[14px] font-bold text-slate-900">Rider Account: John K.</h3>
                <p className="text-[13px] text-slate-500">Repeated cancellation policy breach</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-600 border-none rounded-md px-3 py-1.5 text-[11px] font-bold cursor-default tracking-wider uppercase">
              ERROR
            </Badge>
          </div>

        </div>
      </Card>

    </div>
  );
}
