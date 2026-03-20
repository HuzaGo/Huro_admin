import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  sellerId?: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  isVisible?: boolean;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  categoryId?: string;
  sellerId: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  images?: File[];
}

export interface UpdateProductPayload {
  productId: string;
  name?: string;
  description?: string;
  categoryId?: string;
  sellerId?: string;
  price?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isVisible?: boolean;
  images?: File[];
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

interface ProductState {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ProductState = {
  products: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (params: FetchProductsParams = {}, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      // Build query string
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
      if (params.categoryId) searchParams.append('categoryId', params.categoryId);
      if (params.search) searchParams.append('search', params.search);
      if (params.inStock !== undefined) searchParams.append('inStock', params.inStock.toString());
      if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);

      const qs = searchParams.toString();
      const url = `/api/v1/products${qs ? `?${qs}` : ''}`;
      
      console.log('Fetching products from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Fetch products response status:', response.status);

      const data = await response.json();
      console.log('Fetch products response data:', data);

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to fetch products';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data; // Assuming data.data holds items and pagination info is at root or inside data
    } catch (error: any) {
      console.error('Fetch products error:', error);
      return rejectWithValue(error.message || 'An error occurred while fetching products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (payload: CreateProductPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const formData = new FormData();
      formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      if (payload.categoryId) formData.append('categoryId', payload.categoryId);
      formData.append('sellerId', payload.sellerId);
      formData.append('price', String(payload.price));
      formData.append('stockQuantity', String(payload.stockQuantity));
      if (payload.lowStockThreshold !== undefined) formData.append('lowStockThreshold', String(payload.lowStockThreshold));
      if (payload.images?.length) {
        payload.images.forEach((file) => formData.append('images', file));
      }

      const response = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to create product';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async (payload: UpdateProductPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const { productId, images, ...rest } = payload;
      const formData = new FormData();
      if (rest.name) formData.append('name', rest.name);
      if (rest.description) formData.append('description', rest.description);
      if (rest.categoryId) formData.append('categoryId', rest.categoryId);
      if (rest.sellerId) formData.append('sellerId', rest.sellerId);
      if (rest.price !== undefined) formData.append('price', String(rest.price));
      if (rest.stockQuantity !== undefined) formData.append('stockQuantity', String(rest.stockQuantity));
      if (rest.lowStockThreshold !== undefined) formData.append('lowStockThreshold', String(rest.lowStockThreshold));
      if (rest.isVisible !== undefined) formData.append('isVisible', String(rest.isVisible));
      if (images?.length) {
        images.forEach((file) => formData.append('images', file));
      }

      const response = await fetch(`/api/v1/products/${productId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to update product';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const response = await fetch(`/api/v1/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to delete product';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return { productId, ...data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isFetching = false;
        
        console.log('API full raw response payload (fulfilled):', action.payload);
        
        // Sometimes APIs wrap in `{ status: 'success', data: { data: [...] } }`
        let rawData = action.payload;
        if (rawData?.data) {
          // It could be `{ data: [...] }` or `{ data: { items: [...] } }`
          rawData = rawData.data;
        }

        let productsArray: Product[] = [];
        if (Array.isArray(rawData)) {
          productsArray = rawData;
        } else if (rawData && Array.isArray(rawData.items)) {
          productsArray = rawData.items;
        } else if (rawData && Array.isArray(rawData.products)) {
          productsArray = rawData.products;
        } else if (rawData && Array.isArray(rawData.results)) {
          productsArray = rawData.results;
        } else if (rawData && rawData.data && Array.isArray(rawData.data)) {
          // Double wrapped data scenario: `payload.data.data`
          productsArray = rawData.data;
        } else if (Array.isArray(action.payload)) {
            productsArray = action.payload;
        }
        
        console.log('Extracted products items array:', productsArray);

        state.products = productsArray;
        
        // Extract pagination
        const metaSource = action.payload?.meta || action.payload?.pagination || rawData?.meta || rawData;
        state.totalCount = metaSource?.total || metaSource?.totalCount || metaSource?.count || productsArray.length || 0;
        state.currentPage = metaSource?.page || metaSource?.currentPage || 1;
        state.totalPages = metaSource?.totalPages || metaSource?.pages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.error('Fetch products rejected with payload:', action.payload);
        state.isFetching = false;
        state.error = action.payload as string;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message || 'Product created successfully!';
        // Optionally, append the product to the local state products array:
        // if (action.payload?.data) state.products.push(action.payload.data);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message || 'Product updated successfully!';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message || 'Product deleted successfully!';
        // Optimistically remove the product from the list without requiring a refetch
        state.products = state.products.filter(p => p.id !== action.payload.productId);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProductMessages } = productSlice.actions;
export default productSlice.reducer;
