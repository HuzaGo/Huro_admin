import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface SellerProduct {
  id: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  customName: string | null;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface Seller {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  pickupLocationName: string | null;
  pickupLocationNote: string | null;
  pickupLocationUrl: string | null;
  pickupLatitude: number | null;
  pickupLongitude: number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: number;
}

export interface CreateSellerPayload {
  sellerName: string;
  description?: string;
  logoFile: File;
  phone: string;
  pickupLocationName: string;
  pickupLocationNote?: string;
  pickupLocationUrl?: string;
  pickupLatitude: number;
  pickupLongitude: number;
}

export interface UpdateSellerPayload {
  sellerId: string;
  sellerName?: string;
  sellerPhone?: string;
  logoFile?: File;
  isActive?: boolean;
  pickupLocationName?: string;
  pickupLocationNote?: string;
  pickupLocationUrl?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
}

export interface FetchSellersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface SellerState {
  sellers: Seller[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  sellerProducts: SellerProduct[];
  isFetchingProducts: boolean;
  productsError: string | null;
  isDeleting: boolean;
  deleteError: string | null;
  isAssigning: boolean;
  assignError: string | null;
  isUpdating: boolean;
  updateError: string | null;
  isUpdatingProduct: boolean;
  updateProductError: string | null;
  isUnassigning: boolean;
  unassignError: string | null;
}

const initialState: SellerState = {
  sellers: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  isLoading: false,
  error: null,
  successMessage: null,
  sellerProducts: [],
  isFetchingProducts: false,
  productsError: null,
  isDeleting: false,
  deleteError: null,
  isAssigning: false,
  assignError: null,
  isUpdating: false,
  updateError: null,
  isUpdatingProduct: false,
  updateProductError: null,
  isUnassigning: false,
  unassignError: null,
};

const normalizeSeller = (item: any): Seller => ({
  id: String(item?.id ?? ''),
  name: item?.name ?? item?.sellerName ?? '',
  description: item?.description ?? null,
  logoUrl: item?.logoUrl ?? null,
  phone: item?.phone ?? item?.sellerPhone ?? null,
  pickupLocationName: item?.pickupLocationName ?? null,
  pickupLocationNote: item?.pickupLocationNote ?? null,
  pickupLocationUrl: item?.pickupLocationUrl ?? null,
  pickupLatitude: typeof item?.pickupLatitude === 'number' ? item.pickupLatitude : null,
  pickupLongitude: typeof item?.pickupLongitude === 'number' ? item.pickupLongitude : null,
  status: item?.status ?? (item?.isActive ? 'ACTIVE' : 'INACTIVE'),
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
  products: item?._count?.sellerProducts ?? 0,
});

export const fetchSellers = createAsyncThunk(
  'sellers/fetch',
  async (params: FetchSellersParams = {}, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);

      const qs = searchParams.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/sellers${qs ? `?${qs}` : ''}`; 

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to fetch sellers';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching sellers');
    }
  }
);

export const fetchSellerProducts = createAsyncThunk(
  'sellers/fetchProducts',
  async (
    { sellerId, page = 1, limit = 20 }: { sellerId: string; page?: number; limit?: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const qs = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/sellers/${sellerId}/products/all?${qs}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to fetch seller products';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching seller products');
    }
  }
);

export const createSeller = createAsyncThunk(
  'sellers/create',
  async (payload: CreateSellerPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/sellers`;

      const formData = new FormData();
      formData.append('sellerName', payload.sellerName);
      formData.append('phone', payload.phone);
      formData.append('pickupLocationName', payload.pickupLocationName);
      formData.append('pickupLatitude', payload.pickupLatitude.toString());
      formData.append('pickupLongitude', payload.pickupLongitude.toString());
      formData.append('logo', payload.logoFile);
      if (payload.description) formData.append('description', payload.description);
      if (payload.pickupLocationNote) formData.append('pickupLocationNote', payload.pickupLocationNote);
      if (payload.pickupLocationUrl) formData.append('pickupLocationUrl', payload.pickupLocationUrl);

      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to create seller';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating seller');
    }
  }
);

export interface AssignProductPayload {
  sellerId: string;
  productId: string;
  price: number;
  stockQuantity: number;
  rank?: number;
  customName?: string;
  customDescription?: string;
}

export const assignProductToSeller = createAsyncThunk(
  'sellers/assignProduct',
  async (payload: AssignProductPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (!token) return rejectWithValue('Authentication token is missing. Please log in again.');

      const { sellerId, ...body } = payload;
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/sellers/${sellerId}/products`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to assign product';
        return rejectWithValue(msg);
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while assigning product');
    }
  }
);

export const updateSeller = createAsyncThunk(
  'sellers/update',
  async (payload: UpdateSellerPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (!token) return rejectWithValue('Authentication token is missing.');

      const formData = new FormData();
      if (payload.sellerName) formData.append('sellerName', payload.sellerName);
      if (payload.sellerPhone) formData.append('sellerPhone', payload.sellerPhone);
      if (payload.logoFile) formData.append('logo', payload.logoFile);
      if (payload.isActive !== undefined) formData.append('isActive', String(payload.isActive));
      if (payload.pickupLocationName) formData.append('pickupLocationName', payload.pickupLocationName);
      if (payload.pickupLocationNote) formData.append('pickupLocationNote', payload.pickupLocationNote);
      if (payload.pickupLocationUrl) formData.append('pickupLocationUrl', payload.pickupLocationUrl);
      if (payload.pickupLatitude !== undefined) formData.append('pickupLatitude', String(payload.pickupLatitude));
      if (payload.pickupLongitude !== undefined) formData.append('pickupLongitude', String(payload.pickupLongitude));

      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/sellers/${payload.sellerId}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to update seller';
        return rejectWithValue(msg);
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating seller');
    }
  }
);

export interface UpdateSellerProductPayload {
  sellerId: string;
  spId: string;
  price?: number;
  stockQuantity?: number;
  isAvailable?: boolean;
}

export const updateSellerProduct = createAsyncThunk(
  'sellers/updateSellerProduct',
  async (payload: UpdateSellerProductPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (!token) return rejectWithValue('Authentication token is missing.');

      const { sellerId, spId, ...body } = payload;
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/sellers/${sellerId}/products/${spId}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to update product';
        return rejectWithValue(msg);
      }
      return { ...data, spId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const unassignSellerProduct = createAsyncThunk(
  'sellers/unassignSellerProduct',
  async ({ sellerId, spId }: { sellerId: string; spId: string }, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      if (!token) return rejectWithValue('Authentication token is missing.');

      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/sellers/${sellerId}/products/${spId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to unassign product';
        return rejectWithValue(msg);
      }
      return spId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deleteSeller = createAsyncThunk(
  'sellers/delete',
  async (sellerId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing. Please log in again.');

      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/admin/sellers/${sellerId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to delete seller';
        return rejectWithValue(msg);
      }

      return sellerId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting seller');
    }
  }
);

const sellerSlice = createSlice({
  name: 'sellers',
  initialState,
  reducers: {
    clearSellerMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sellers
      .addCase(fetchSellers.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchSellers.fulfilled, (state, action) => {
        state.isFetching = false;
        
        const payload = action.payload;
        const dataNode = payload?.data;

        // Supports response shapes like:
        // 1) { data: { data: [...], meta: {...} } }
        // 2) { data: [...] }
        // 3) { items: [...], meta: {...} }
        // 4) [...]
        const listSource =
          (Array.isArray(dataNode?.data) && dataNode.data) ||
          (Array.isArray(dataNode) && dataNode) ||
          (Array.isArray(payload?.items) && payload.items) ||
          (Array.isArray(payload) && payload) ||
          [];

        const sellersArray: Seller[] = listSource.map(normalizeSeller);

        state.sellers = sellersArray;
        
        const metaSource =
          dataNode?.meta ||
          payload?.meta ||
          payload?.pagination ||
          {};
        state.totalCount = metaSource?.total || metaSource?.totalCount || metaSource?.count || sellersArray.length || 0;
        state.currentPage = metaSource?.page || metaSource?.currentPage || 1;
        state.totalPages = metaSource?.totalPages || metaSource?.pages || 1;
      })
      .addCase(fetchSellers.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      // Create Seller
      .addCase(createSeller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message || 'Seller created successfully!';
      })
      .addCase(createSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Seller Products
      .addCase(fetchSellerProducts.pending, (state) => {
        state.isFetchingProducts = true;
        state.productsError = null;
        state.sellerProducts = [];
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.isFetchingProducts = false;
        console.log('[fetchSellerProducts] raw payload:', action.payload);
        const payload = action.payload;
        const items: SellerProduct[] =
          payload?.data?.items ??
          payload?.data?.data?.items ??
          payload?.data?.products ??
          (Array.isArray(payload?.data) ? payload.data : null) ??
          payload?.items ??
          [];
        console.log('[fetchSellerProducts] extracted items:', items);
        state.sellerProducts = items;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.isFetchingProducts = false;
        state.productsError = action.payload as string;
      })
      // Delete Seller
      .addCase(deleteSeller.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteSeller.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.sellers = state.sellers.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteSeller.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      })
      // Assign Product
      .addCase(assignProductToSeller.pending, (state) => {
        state.isAssigning = true;
        state.assignError = null;
      })
      .addCase(assignProductToSeller.fulfilled, (state) => {
        state.isAssigning = false;
      })
      .addCase(assignProductToSeller.rejected, (state, action) => {
        state.isAssigning = false;
        state.assignError = action.payload as string;
      })
      // Update Seller Product
      .addCase(updateSellerProduct.pending, (state) => {
        state.isUpdatingProduct = true;
        state.updateProductError = null;
      })
      .addCase(updateSellerProduct.fulfilled, (state, action) => {
        state.isUpdatingProduct = false;
        const updated = action.payload?.data ?? action.payload;
        if (updated?.id) {
          state.sellerProducts = state.sellerProducts.map((p) =>
            p.id === updated.id ? { ...p, ...updated } : p
          );
        }
      })
      .addCase(updateSellerProduct.rejected, (state, action) => {
        state.isUpdatingProduct = false;
        state.updateProductError = action.payload as string;
      })
      // Unassign Seller Product
      .addCase(unassignSellerProduct.pending, (state) => {
        state.isUnassigning = true;
        state.unassignError = null;
      })
      .addCase(unassignSellerProduct.fulfilled, (state, action) => {
        state.isUnassigning = false;
        state.sellerProducts = state.sellerProducts.filter((p) => p.id !== action.payload);
      })
      .addCase(unassignSellerProduct.rejected, (state, action) => {
        state.isUnassigning = false;
        state.unassignError = action.payload as string;
      })
      // Update Seller
      .addCase(updateSeller.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateSeller.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updated = normalizeSeller(action.payload?.data ?? action.payload);
        state.sellers = state.sellers.map((s) => s.id === updated.id ? updated : s);
        state.successMessage = action.payload?.message || 'Seller updated successfully!';
      })
      .addCase(updateSeller.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      });
  },
});

export const { clearSellerMessages } = sellerSlice.actions;
export default sellerSlice.reducer;