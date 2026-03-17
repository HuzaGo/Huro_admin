"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createCategory, fetchCategories, clearCategoryMessages } from "@/store/slices/categorySlice"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CategoriesPage() {
  const [name, setName] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [sortOrder, setSortOrder] = useState<number>(0)
  
  const dispatch = useAppDispatch()
  const { categories, isFetching, isLoading, error, successMessage } = useAppSelector((state) => state.categories)
  const categoryList = Array.isArray(categories) ? categories : []

  useEffect(() => {
    dispatch(fetchCategories())
    
    // Clear messages when unmounting
    return () => {
      dispatch(clearCategoryMessages())
    }
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const resultAction = await dispatch(createCategory({ name, iconUrl, sortOrder }))
    
    if (createCategory.fulfilled.match(resultAction)) {
      // clear form on success
      setName("")
      setIconUrl("")
      setSortOrder(0)
      
      // refresh categories list
      dispatch(fetchCategories())
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage product categories for the application.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Category Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Category</CardTitle>
            <CardDescription>Add a new product category</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {typeof error === 'string' ? error : (error as any).message || JSON.stringify(error)}
                </div>
              )}
              {successMessage && (
                <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded-md">
                  {typeof successMessage === 'string' ? successMessage : (successMessage as any).message || JSON.stringify(successMessage)}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Category Name <span className="text-red-500">*</span></label>
                <Input
                  id="name"
                  placeholder="e.g. Electronics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="iconUrl" className="text-sm font-medium">Icon URL</label>
                <Input
                  id="iconUrl"
                  placeholder="https://example.com/icon.png"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sortOrder" className="text-sm font-medium">Sort Order</label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
                {isLoading ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Categories</CardTitle>
            <CardDescription>List of all current categories</CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex justify-center p-4 text-sm text-muted-foreground">Loading categories...</div>
            ) : categoryList.length === 0 ? (
              <div className="flex justify-center p-4 text-sm text-muted-foreground">No categories found.</div>
            ) : (
              <div className="relative w-full overflow-auto max-h-[350px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="text-right">Sort Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryList.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.iconUrl ? (
                            <img src={category.iconUrl} alt={category.name} className="w-8 h-8 object-cover rounded-md bg-muted" />
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{category.slug}</TableCell>
                        <TableCell className="text-right">{category.sortOrder}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
