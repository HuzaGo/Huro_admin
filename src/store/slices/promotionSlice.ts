import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type PromotionType = 'DISCOUNT' | 'ADDITIONAL' | 'FREE_DELIVERY' | 'CASHBACK' | 'FLASH_SALE';
export type PromotionScope = 'CART_WIDE' | 'CATEGORY' | 'SPECIFIC' | 'BUNDLE' | 'PRODUCT';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface PromotionProduct {
  productId: string;
  requiredQuantity: number;
  isFreeItem: boolean;
  product?: { name: string };
}

export interface PromotionCategoryGate {
  categoryId: string;
  requiredQuantity: number;
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

const promotionSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    clearPromotionMessages: (state) => {
      state.createError = null;
      state.createSuccess = null;
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
      });
  },
});

export const { clearPromotionMessages } = promotionSlice.actions;
export default promotionSlice.reducer;
