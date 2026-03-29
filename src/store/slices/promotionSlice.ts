import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type PromotionType = 'DISCOUNT' | 'ADDITIONAL' | 'FREE_DELIVERY' | 'CASHBACK' | 'FLASH_SALE';
export type PromotionScope = 'CART_WIDE' | 'CATEGORY' | 'SPECIFIC' | 'BUNDLE' | 'PRODUCT';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  bannerUrl?: string;
  type: PromotionType;
  scope: PromotionScope;
  categoryId?: string;
  productIds?: string[];
  discountType: DiscountType;
  discountValue: number;
  minCartValue: number;
  minQuantity?: number | null;
  freeQuantity?: number | null;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
  createdAt?: string;
  category?: { id: string; name: string } | null;
  products?: any[];
  categoryGates?: any[];
}

export interface CreatePromotionPayload {
  title: string;
  description?: string;
  type: PromotionType;
  scope: PromotionScope;
  categoryId: string | null;
  productIds: string[] | null;
  discountType: DiscountType;
  discountValue: number;
  minCartValue: number;
  minQuantity?: number | null;
  freeQuantity?: number | null;
  startsAt: string;
  endsAt: string;
}

interface PromotionState {
  promotionsList: Promotion[];
  activePromotionsList: Promotion[];
  isFetching: boolean;
  isFetchingActive: boolean;
  isCreating: boolean;
  error: string | null;
  activeError: string | null;
  createError: string | null;
  createSuccess: string | null;
}

const initialState: PromotionState = {
  promotionsList: [],
  activePromotionsList: [],
  isFetching: false,
  isFetchingActive: false,
  isCreating: false,
  error: null,
  activeError: null,
  createError: null,
  createSuccess: null,
};

export const fetchPromotions = createAsyncThunk(
  'promotions/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch('/api/v1/promotions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to fetch promotions';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// No auth required — returns a flat array: { data: [...] }
export const fetchActivePromotions = createAsyncThunk(
  'promotions/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/promotions/active');

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to fetch active promotions';
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
        if (Array.isArray(data.details) && data.details.length > 0) {
          const detail = data.details
            .map((d: any) => `${d.field}: ${d.message}`)
            .join(' | ');
          return rejectWithValue(detail);
        }
        const msg = data.error || data.message || 'Failed to create promotion';
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
      .addCase(fetchActivePromotions.pending, (state) => {
        state.isFetchingActive = true;
        state.activeError = null;
      })
      .addCase(fetchActivePromotions.fulfilled, (state, action) => {
        state.isFetchingActive = false;
        // Response: { success: true, data: [...] }
        const list = action.payload?.data;
        state.activePromotionsList = Array.isArray(list) ? list : [];
      })
      .addCase(fetchActivePromotions.rejected, (state, action) => {
        state.isFetchingActive = false;
        state.activeError = action.payload as string;
      })
      .addCase(fetchPromotions.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.isFetching = false;
        const payload = action.payload;
        state.promotionsList = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
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
          state.activePromotionsList = [promo, ...state.activePromotionsList];
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
