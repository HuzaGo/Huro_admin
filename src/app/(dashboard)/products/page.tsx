"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchCategories } from "@/store/slices/categorySlice"
import { createProduct, clearProductMessages } from "@/store/slices/productSlice"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function ProductsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [stockQuantity, setStockQuantity] = useState<number>(0)
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(0)
  const [pickupLocationName, setPickupLocationName] = useState("")
  const [pickupLocationNote, setPickupLocationNote] = useState("")
  const [pickupLocationUrl, setPickupLocationUrl] = useState("")
  const [pickupLatitude, setPickupLatitude] = useState<number>(0)
  const [pickupLongitude, setPickupLongitude] = useState<number>(0)
  
  const dispatch = useAppDispatch()
  const { categories } = useAppSelector((state) => state.categories)
  const categoryList = Array.isArray(categories) ? categories : []
  
  const { products, isFetching, isLoading, error, successMessage } = useAppSelector((state) => state.products)
  const productList = Array.isArray(products) ? products : []

  useEffect(() => {
    // Fetch categories to populate the dropdown
    dispatch(fetchCategories())
    
    // Fetch products
    // dispatch(fetchProducts()) // Assuming you will add this later
    
    // Clear messages when unmounting
    return () => {
      dispatch(clearProductMessages())
    }
  }, [dispatch])

  // Reset form when sheet is toggled manually (e.g. closing)
  useEffect(() => {
    if (!isSheetOpen) {
      setTimeout(() => {
        setEditingProductId(null)
        setName("")
        setDescription("")
        setCategoryId("")
        setPrice(0)
        setStockQuantity(0)
        setLowStockThreshold(0)
        setPickupLocationName("")
        setPickupLocationNote("")
        setPickupLocationUrl("")
        setPickupLatitude(0)
        setPickupLongitude(0)
        dispatch(clearProductMessages())
      }, 300)
    }
  }, [isSheetOpen, dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      name,
      description,
      categoryId,
      price,
      stockQuantity,
      lowStockThreshold,
      pickupLocationName,
      pickupLocationNote,
      pickupLocationUrl,
      pickupLatitude,
      pickupLongitude
    }

    let resultAction;
    if (editingProductId) {
      // resultAction = await dispatch(updateProduct({ productId: editingProductId, ...payload }))
    } else {
      resultAction = await dispatch(createProduct(payload))
    }
    
    if (createProduct.fulfilled.match(resultAction)) {
      // Close the sheet - form reset is handled by the useEffect above
      setIsSheetOpen(false)
      
      // refresh products list
      // dispatch(fetchProducts()) // Fetch the new list
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage products inside categories.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Product
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl w-full overflow-y-auto px-6 py-8">
            <SheetHeader>
              <SheetTitle>{editingProductId ? "Edit Product" : "Create Product"}</SheetTitle>
              <SheetDescription>
                {editingProductId ? "Update the details of the product." : "Add a new product to your inventory."}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-stretch w-full justify-start items-start">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md w-full">
                    {typeof error === 'string' ? error : (error as any).message || JSON.stringify(error)}
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded-md w-full">
                    {typeof successMessage === 'string' ? successMessage : (successMessage as any).message || JSON.stringify(successMessage)}
                  </div>
                )}

                <div className="space-y-4 w-full">
                  <h3 className="font-semibold text-lg border-b pb-2">Basic Info</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="e.g. Jollof Rice"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="description"
                      placeholder="e.g. Spicy rice dish"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category <span className="text-red-500">*</span></Label>
                    <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryList.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity">Stock Quantity <span className="text-red-500">*</span></Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        min="0"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStockThreshold">Low Stock Threshold <span className="text-red-500">*</span></Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        min="0"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 w-full mt-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Pickup Location Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="pickupLocationName">Location Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="pickupLocationName"
                      placeholder="e.g. Main Canteen"
                      value={pickupLocationName}
                      onChange={(e) => setPickupLocationName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupLocationNote">Location Note <span className="text-red-500">*</span></Label>
                    <Input
                      id="pickupLocationNote"
                      placeholder="e.g. Ask for counter 3"
                      value={pickupLocationNote}
                      onChange={(e) => setPickupLocationNote(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pickupLocationUrl">Location URL <span className="text-red-500">*</span></Label>
                    <Input
                      id="pickupLocationUrl"
                      type="url"
                      placeholder="e.g. https://maps.google.com/..."
                      value={pickupLocationUrl}
                      onChange={(e) => setPickupLocationUrl(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickupLatitude">Latitude <span className="text-red-500">*</span></Label>
                      <Input
                        id="pickupLatitude"
                        type="number"
                        step="any"
                        value={pickupLatitude}
                        onChange={(e) => setPickupLatitude(parseFloat(e.target.value) || 0)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupLongitude">Longitude <span className="text-red-500">*</span></Label>
                      <Input
                        id="pickupLongitude"
                        type="number"
                        step="any"
                        value={pickupLongitude}
                        onChange={(e) => setPickupLongitude(parseFloat(e.target.value) || 0)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={isLoading || !name.trim()}>
                  {isLoading ? (editingProductId ? "Updating..." : "Creating...") : (editingProductId ? "Update Product" : "Create Product")}
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
          <CardDescription>List of all current products</CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex justify-center p-4 text-sm text-muted-foreground">Loading products...</div>
          ) : productList.length === 0 ? (
            <div className="flex justify-center p-4 text-sm text-muted-foreground">No products found or not fetched yet.</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productList.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{product.categoryId}</TableCell>
                      <TableCell className="text-right">{product.price}</TableCell>
                      <TableCell className="text-right">{product.stockQuantity}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Delete Product"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
