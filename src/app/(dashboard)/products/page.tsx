"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchCategories } from "@/store/slices/categorySlice"
import { fetchSellers } from "@/store/slices/sellerSlice"
import { createProduct, updateProduct, deleteProduct, fetchProducts, clearProductMessages, Product } from "@/store/slices/productSlice"
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
  const [sellerId, setSellerId] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [stockQuantity, setStockQuantity] = useState<number>(0)
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(0)
  const [images, setImages] = useState<File[]>([])
  
  const dispatch = useAppDispatch()
  const { categories } = useAppSelector((state) => state.categories)
  const categoryList = Array.isArray(categories) ? categories : []
  
  const { sellers } = useAppSelector((state) => state.sellers)
  const sellerList = Array.isArray(sellers) ? sellers : []
  
  const { products, isFetching, isLoading, error, successMessage } = useAppSelector((state) => state.products)
  const productList = Array.isArray(products) ? products : []

  useEffect(() => {
    // Fetch categories to populate the dropdown
    dispatch(fetchCategories())
    
    // Fetch sellers to populate the dropdown
    dispatch(fetchSellers({ limit: 100 })) // Assuming we want enough to pick from
    
    // Fetch products
    dispatch(fetchProducts({ page: 1, limit: 20, sortBy: 'newest' }))
    
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
        setSellerId("")
        setPrice(0)
        setStockQuantity(0)
        setLowStockThreshold(0)
        setImages([])
        dispatch(clearProductMessages())
      }, 300)
    }
  }, [isSheetOpen, dispatch])

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setName(product.name || "")
    setDescription(product.description || "")
    setCategoryId(product.categoryId || "")
    setSellerId(product.sellerId || "")
    setPrice(product.price ?? 0)
    setStockQuantity(product.stockQuantity ?? 0)
    setLowStockThreshold(product.lowStockThreshold ?? 0)
    setImages([])
    setIsSheetOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      name,
      description: description || undefined,
      categoryId: categoryId || undefined,
      sellerId,
      price: Number(price) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || undefined,
      images: images.length ? images : undefined,
    }

    let resultAction;
    if (editingProductId) {
      resultAction = await dispatch(updateProduct({ productId: editingProductId, ...payload }))
    } else {
      resultAction = await dispatch(createProduct(payload))
    }
    
    if (createProduct.fulfilled.match(resultAction) || updateProduct.fulfilled.match(resultAction)) {
      // Close the sheet - form reset is handled by the useEffect above
      setIsSheetOpen(false)
      
      // refresh products list
      dispatch(fetchProducts({ page: 1, limit: 20, sortBy: 'newest' }))
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action generally marks it as deleted and may fail if it has active orders.")) {
      const resultAction = await dispatch(deleteProduct(productId));
      if (deleteProduct.fulfilled.match(resultAction)) {
        // optionally refresh if standard optimistic UI delete isn't enough:
        // dispatch(fetchProducts({ page: 1, limit: 20, sortBy: 'newest' }))
      }
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
          <SheetTrigger render={<Button className="flex items-center gap-2" />}>
            <Plus className="w-4 h-4" />
            Create Product
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl w-full overflow-y-auto px-6 py-8">
            <SheetHeader>
              <SheetTitle>{editingProductId ? "Edit Product" : "Create Product"}</SheetTitle>
              <SheetDescription>
                {editingProductId ? "Update the details of the product." : "Add a new product to your inventory."}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6 flex flex-col w-full">
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
                    <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "")} disabled={isLoading} required>
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

                  <div className="space-y-2">
                    <Label htmlFor="sellerId">Seller <span className="text-red-500">*</span></Label>
                    <Select value={sellerId} onValueChange={(val) => setSellerId(val || "")} disabled={isLoading} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a seller" />
                      </SelectTrigger>
                      <SelectContent>
                        {sellerList.map((seller) => (
                          <SelectItem key={seller.id} value={seller.id}>
                            {seller.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
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

                <div className="space-y-2 w-full">
                  <Label htmlFor="images">
                    Product Images <span className="text-muted-foreground text-xs">(up to 5)</span>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isLoading}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(0, 5)
                      setImages(files)
                    }}
                  />
                  {images.length > 0 && (
                    <p className="text-xs text-muted-foreground">{images.length} file(s) selected</p>
                  )}
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
          {error && (
            <div className="mb-4 p-4 text-sm text-red-500 bg-red-100 rounded-md border border-red-200">
              Error fetching products: {error}
            </div>
          )}
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
                  {productList.map((product) => {
                    const category = categoryList.find(c => c.id === product.categoryId);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{category ? category.name : product.categoryId}</TableCell>
                        <TableCell className="text-right">{product.price}</TableCell>
                        <TableCell className="text-right">{product.stockQuantity}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Edit Product"
                            onClick={() => handleEditProduct(product)}
                            disabled={isLoading}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Delete Product"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
