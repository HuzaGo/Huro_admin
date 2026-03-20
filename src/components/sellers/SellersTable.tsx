import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Seller } from "@/store/slices/sellerSlice";

interface Props {
  sellers: Seller[];
  isFetching: boolean;
  selectedSellerId: string | null;
  onSelect: (id: string) => void;
}

export function SellersTable({ sellers, isFetching, selectedSellerId, onSelect }: Props) {
  return (
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              </TableCell>
            </TableRow>
          ) : sellers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                No sellers found.
              </TableCell>
            </TableRow>
          ) : sellers.map((seller) => (
            <TableRow
              key={seller.id}
              onClick={() => onSelect(seller.id)}
              className={`cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${
                selectedSellerId === seller.id ? "bg-blue-50/50 relative" : ""
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
                  Category
                </Badge>
              </TableCell>
              <TableCell className="text-center font-medium text-gray-600">{0}</TableCell>
              <TableCell className="text-center font-medium text-gray-600">{0}</TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex items-center justify-end gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${seller.status === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={`text-sm font-medium ${seller.status === "ACTIVE" ? "text-green-600" : "text-gray-500"}`}>
                    {seller.status || "ACTIVE"}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
