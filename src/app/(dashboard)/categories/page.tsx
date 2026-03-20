"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createCategory, updateCategory, fetchCategories, deleteCategory, clearCategoryMessages } from "@/store/slices/categorySlice"
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
import { Plus, Pencil, Trash2, ImagePlus, X } from "lucide-react"
import { useRef } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function CategoriesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isActive, setIsActive] = useState<boolean>(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  // Reset form when sheet is toggled manually (e.g. closing)
  useEffect(() => {
    if (!isSheetOpen) {
      setTimeout(() => {
        setEditingCategoryId(null)
        setName("")
        setIconFile(null)
        setIconPreview(null)
        setSortOrder(0)
        setIsActive(true)
        dispatch(clearCategoryMessages())
      }, 300)
    }
  }, [isSheetOpen, dispatch])

  const handleEditClick = (category: any) => {
    setEditingCategoryId(category.id)
    setName(category.name)
    setIconFile(null)
    setIconPreview(category.iconUrl || null)
    setSortOrder(category.sortOrder || 0)
    setIsActive(category.isActive !== false)
    setIsSheetOpen(true)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    let resultAction;
    if (editingCategoryId) {
      resultAction = await dispatch(updateCategory({ categoryId: editingCategoryId, name, iconFile: iconFile ?? undefined, sortOrder, isActive }))
    } else {
      resultAction = await dispatch(createCategory({ name, iconFile: iconFile ?? undefined, sortOrder }))
    }

    if (createCategory.fulfilled.match(resultAction) || updateCategory.fulfilled.match(resultAction)) {
      setName("")
      setIconFile(null)
      setIconPreview(null)
      setSortOrder(0)
      setIsActive(true)
      setEditingCategoryId(null)
      setIsSheetOpen(false)
      dispatch(fetchCategories())
    }
  }

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      const resultAction = await dispatch(deleteCategory(id))
      if (deleteCategory.fulfilled.match(resultAction)) {
        dispatch(fetchCategories())
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories for the application.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger 
            render={
              <Button className="flex items-center gap-2" />
            }
          >
            <Plus className="w-4 h-4" />
            Create Category
          </SheetTrigger>
          <SheetContent className="sm:max-w-md w-full overflow-y-auto px-6 py-8">
            <SheetHeader>
              <SheetTitle>{editingCategoryId ? "Edit Category" : "Create Category"}</SheetTitle>
              <SheetDescription>
                {editingCategoryId ? "Update the details of the category." : "Add a new product category here."}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
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
                  <label className="text-sm font-medium">Icon Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setIconFile(file);
                      setIconPreview(file ? URL.createObjectURL(file) : null);
                    }}
                    disabled={isLoading}
                  />
                  {iconPreview ? (
                    <div className="relative w-20 h-20">
                      <img src={iconPreview} alt="Icon preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => { setIconFile(null); setIconPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-200 shadow p-0.5 text-gray-500 hover:text-red-500"
                        disabled={isLoading}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors w-full justify-center"
                    >
                      <ImagePlus className="w-4 h-4" />
                      Upload icon image
                    </button>
                  )}
                </div>

{editingCategoryId && (
                  <div className="space-y-2 flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      className="w-4 h-4 rounded border-gray-300"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={isLoading}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium m-0">Is Active</label>
                  </div>
                )}

                <Button type="submit" className="w-full mt-4" disabled={isLoading || !name.trim()}>
                  {isLoading ? (editingCategoryId ? "Updating..." : "Creating...") : (editingCategoryId ? "Update Category" : "Create Category")}
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

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
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sort Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${category.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {category.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{category.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditClick(category)}
                          title="Edit Category"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteClick(category.id, category.name)}
                          title="Delete Category"
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
