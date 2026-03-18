import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  pickupLocationName: string;
  pickupLocationNote: string;
  pickupLocationUrl: string;
  pickupLatitude: number;
  pickupLongitude: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  pickupLocationName: string;
  pickupLocationNote: string;
  pickupLocationUrl: string;
  pickupLatitude: number;
  pickupLongitude: number;
}

interface ProductState {
  products: Product[];
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ProductState = {
  products: [],
  isFetching: false,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const createProduct = createAsyncThunk(
  'products/create',
  async (payload: CreateProductPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const response = await fetch('/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || data.error || 'Failed to create product');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating product');
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
      });
  },
});

export const { clearProductMessages } = productSlice.actions;
export default productSlice.reducer;
