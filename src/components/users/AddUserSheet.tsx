"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createUser, fetchUsers, clearUserMessages, CreateUserPayload } from "@/store/slices/userSlice";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "" as CreateUserPayload["role"] | "",
};

export function AddUserSheet({ open, onOpenChange }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error, successMessage } = useAppSelector((s) => s.users);
  const [form, setForm] = useState(emptyForm);

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setForm(emptyForm);
      dispatch(clearUserMessages());
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.role) return;

    const result = await dispatch(createUser(form as CreateUserPayload));
    if (createUser.fulfilled.match(result)) {
      dispatch(fetchUsers({ page: 1, limit: 20 }));
      setTimeout(handleClose, 1200);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create New User</SheetTitle>
          <SheetDescription>Register a new user account. An OTP will be sent to their email.</SheetDescription>
        </SheetHeader>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="Alice Uwase"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="alice@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+250788000000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Secret@123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(val) => setForm((prev) => ({ ...prev, role: val as CreateUserPayload["role"] }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="RIDER">Rider</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !form.role} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
