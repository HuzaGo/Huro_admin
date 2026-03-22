"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers, updateUserStatus, deleteUser } from "@/store/slices/userSlice";
import { AddUserSheet } from "@/components/users/AddUserSheet";
import { Search, Plus, X, Mail, Phone, Calendar, ShieldAlert, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data
const users = [
  {
    id: "usr-1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+250 788 123 456",
    role: "Customer",
    status: "ACTIVE",
    joinedDate: "12 Oct, 2025",
    lastActive: "2 hours ago",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    recentOrders: [
      { id: "ORD-1234", date: "Today", amount: "2,500 RWF", status: "Delivered", statusColor: "success" },
      { id: "ORD-1220", date: "10 Mar", amount: "4,200 RWF", status: "Delivered", statusColor: "success" },
    ]
  },
  {
    id: "usr-2",
    name: "Sarah Kim",
    email: "sarah.k@example.com",
    phone: "+250 782 987 654",
    role: "Admin",
    status: "ACTIVE",
    joinedDate: "05 Jan, 2025",
    lastActive: "Active Now",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    recentOrders: []
  },
  {
    id: "usr-3",
    name: "Michael R.",
    email: "mike.r@example.com",
    phone: "+250 733 456 789",
    role: "Customer",
    status: "SUSPENDED",
    joinedDate: "20 Feb, 2026",
    lastActive: "5 days ago",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    recentOrders: [
      { id: "ORD-1150", date: "08 Mar", amount: "1,800 RWF", status: "Cancelled", statusColor: "destructive" }
    ]
  }
];

export default function UsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { usersList, isFetching } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    dispatch(fetchUsers({ page: 1, limit: 20, search: e.target.value }));
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    // Assuming backend takes { isActive: boolean } in a standard PATCH payload
    dispatch(updateUserStatus({ userId, isActive: !currentStatus }));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      dispatch(deleteUser(userId));
      if (selectedUserId === userId) {
        setSelectedUserId(null); // Close the side panel if the deleted user was selected
      }
    }
  };

  const selectedUser = usersList.find(u => u.id === selectedUserId);
  const selectedMockUser = users.find(u => u.id === selectedUserId) || users[0]; // fallback for mock details for now

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedUserId ? 'pr-0' : ''}`}>
        <div className="p-6 flex-1 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage user accounts, roles, and platform access.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search users by name, email..."
                  className="pl-9 bg-white"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setAddUserOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* Table Card */}
          <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="font-semibold text-gray-500">User</TableHead>
                  <TableHead className="font-semibold text-gray-500">Role</TableHead>
                  <TableHead className="font-semibold text-gray-500 text-center">Joined Date</TableHead>
                  <TableHead className="font-semibold text-gray-500 text-center">Last Active</TableHead>
                  <TableHead className="font-semibold text-gray-500 text-right pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : usersList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  usersList.map((user) => (
                    <TableRow 
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id === selectedUserId ? null : user.id)}
                      className={`cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${
                        selectedUserId === user.id ? 'bg-blue-50/50 relative' : ''
                      }`}
                    >
                      {/* Active row indicator */}
                      <TableCell className="py-4 relative">
                        {selectedUserId === user.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                        )}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {user.fullName ? user.fullName.charAt(0) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.fullName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'} font-normal`}>
                          {user.role || 'USER'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-gray-600 text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center text-gray-600 text-sm">
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-500'}`}>
                            {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      <AddUserSheet open={addUserOpen} onOpenChange={setAddUserOpen} />

      {/* Details Side Panel */}
      {selectedUserId && selectedUser && (
        <div className="w-100 border-l border-gray-200 bg-white shadow-xl flex flex-col animate-in slide-in-from-right-8 fade-in duration-300 z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">User Profile</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-500 hover:bg-gray-100"
              onClick={() => setSelectedUserId(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* User Profile */}
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0) : 'U'}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-gray-900">{selectedUser.fullName || 'N/A'}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 font-normal">
                  {selectedUser.role || 'USER'}
                </Badge>
                {selectedUser.isActive ? (
                  <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 font-normal">Active</Badge>
                ) : (
                  <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 font-normal">Suspended</Badge>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Information</h4>
              <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Joined {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-col">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                <Mail className="h-4 w-4 mr-2" />
                Message
              </Button>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => handleToggleStatus(selectedUser.id, selectedUser.isActive)}
                  className={`flex-1 ${selectedUser.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                >
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  {selectedUser.isActive ? 'Suspend' : 'Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="flex-none px-4 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  title="Delete User"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* Recent Orders Overview (Only for customers) */}
            {selectedUser.role === 'CUSTOMER' && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Recent Orders</h4>
                {selectedMockUser?.recentOrders?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMockUser.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-50 rounded-md flex items-center justify-center shrink-0">
                            <ShoppingBag className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">{order.id}</p>
                            <p className="text-xs text-gray-500">{order.date}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 mb-1">{order.amount}</p>
                          <Badge variant="secondary" className={`
                            text-[10px] font-semibold tracking-wider
                            ${order.statusColor === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                            ${order.statusColor === 'destructive' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                          `}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                    <p className="text-sm text-gray-500">No recent orders found for this user.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
