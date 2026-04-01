import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type PromotionType = 'DISCOUNT' | 'ADDITIONAL' | 'FREE_DELIVERY' | 'CASHBACK' | 'FLASH_SALE';
export type PromotionScope = 'CART_WIDE' | 'CATEGORY' | 'SPECIFIC' | 'BUNDLE' | 'PRODUCT';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface PromotionProduct {
  productId: string;
  requiredQuantity: number;
  isFreeItem: boolean;
  product?: { id: string; name: string; imageUrls?: string[] };
}

export interface PromotionCategoryGate {
  categoryId: string;
  requiredQuantity: number;
  category?: { id: string; name: string };
}

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  bannerUrl?: string;
  type: PromotionType;
  scope: PromotionScope;
  categoryId?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minCartValue?: number;
  minQuantity?: number | null;
  freeQuantity?: number | null;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: { id: string; name: string } | null;
  products?: PromotionProduct[];
  categoryGates?: PromotionCategoryGate[];
}

export interface CreatePromotionPayload {
  title: string;
  description?: string;
  bannerUrl?: string;
  type?: PromotionType;
  scope: PromotionScope;
  categoryId?: string;
  products?: PromotionProduct[];
  categoryGates?: PromotionCategoryGate[];
  discountType?: DiscountType;
  discountValue?: number;
  minCartValue?: number;
  minQuantity?: number;
  freeQuantity?: number;
  startsAt: string;
  endsAt: string;
}

export interface FetchPromotionsParams {
  page?: number;
  limit?: number;
  scope?: PromotionScope | '';
  isActive?: boolean;
}

interface PromotionState {
  promotionsList: Promotion[];
  total: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  isCreating: boolean;
  error: string | null;
  createError: string | null;
  createSuccess: string | null;
  selectedPromotion: Promotion | null;
  isFetchingOne: boolean;
  fetchOneError: string | null;
  isDeleting: boolean;
  deleteError: string | null;
}

const initialState: PromotionState = {
  promotionsList: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  isCreating: false,
  error: null,
  createError: null,
  createSuccess: null,
  selectedPromotion: null,
  isFetchingOne: false,
  fetchOneError: null,
  isDeleting: false,
  deleteError: null,
};

export const fetchPromotions = createAsyncThunk(
  'promotions/fetch',
  async (params: FetchPromotionsParams = {}, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const qs = new URLSearchParams({
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 20),
      });
      if (params.scope) qs.set('scope', params.scope);
      if (params.isActive !== undefined) qs.set('isActive', String(params.isActive));

      const response = await fetch(`/api/v1/promotions?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to fetch promotions';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const createPromotion = createAsyncThunk(
  'promotions/create',
  async (payload: CreatePromotionPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch('/api/v1/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data?.error?.details) && data.error.details.length > 0) {
          const detail = data.error.details
            .map((d: any) => `${d.field}: ${d.message}`)
            .join(' | ');
          return rejectWithValue(detail);
        }
        const msg = data?.error?.message || data?.message || 'Failed to create promotion';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const fetchPromotionById = createAsyncThunk(
  'promotions/fetchById',
  async (promotionId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/promotions/${promotionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to fetch promotion';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deletePromotion = createAsyncThunk(
  'promotions/delete',
  async (promotionId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/promotions/${promotionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to delete promotion';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      return { promotionId, message: data?.message };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const promotionSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    clearPromotionMessages: (state) => {
      state.createError = null;
      state.createSuccess = null;
    },
    clearSelectedPromotion: (state) => {
      state.selectedPromotion = null;
      state.fetchOneError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromotions.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.isFetching = false;
        const payload = action.payload?.data;
        // Support both { data: [...], meta: {...} } and flat array
        const items = Array.isArray(payload?.data) ? payload.data
          : Array.isArray(payload) ? payload
          : [];
        state.promotionsList = items;
        state.total = payload?.meta?.total ?? items.length;
        state.currentPage = payload?.meta?.page ?? 1;
        state.totalPages = payload?.meta?.totalPages ?? 1;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      .addCase(createPromotion.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createSuccess = action.payload?.message || 'Promotion created successfully!';
        const promo = action.payload?.data ?? action.payload;
        if (promo?.id) {
          state.promotionsList = [promo, ...state.promotionsList];
        }
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      .addCase(fetchPromotionById.pending, (state) => {
        state.isFetchingOne = true;
        state.fetchOneError = null;
        state.selectedPromotion = null;
      })
      .addCase(fetchPromotionById.fulfilled, (state, action) => {
        state.isFetchingOne = false;
        state.selectedPromotion = action.payload?.data ?? action.payload;
      })
      .addCase(fetchPromotionById.rejected, (state, action) => {
        state.isFetchingOne = false;
        state.fetchOneError = action.payload as string;
      })
      .addCase(deletePromotion.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.promotionsList = state.promotionsList.filter(
          (p) => p.id !== action.payload.promotionId
        );
        state.selectedPromotion = null;
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearPromotionMessages, clearSelectedPromotion } = promotionSlice.actions;
export default promotionSlice.reducer;
