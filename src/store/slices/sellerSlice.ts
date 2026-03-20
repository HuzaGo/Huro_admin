import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
  description: string;
  logoUrl: string;
  phone: string;
  pickupLocationName: string;
  pickupLocationNote: string;
  pickupLocationUrl: string;
  pickupLatitude: number;
  pickupLongitude: number;
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

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
      });
  },
});

export const { clearSellerMessages } = sellerSlice.actions;
export default sellerSlice.reducer;