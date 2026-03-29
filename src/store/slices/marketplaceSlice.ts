import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type ListingCondition = 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'FOR_PARTS';
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'EXPIRED';
export type ModerationAction = 'APPROVE' | 'REMOVE';

export interface MarketplaceListing {
  id: string;
  title: string;
  description?: string;
  condition: ListingCondition;
  askingPrice: string | number;
  isNegotiable: boolean;
  images: string[];
  status?: ListingStatus;
  viewCount: number;
  expiresAt: string;
  createdAt: string;
  category?: { name: string };
  seller?: { id: string; fullName: string; avatarUrl?: string };
}

export interface FetchListingsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  condition?: ListingCondition | '';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ModerateListingPayload {
  listingId: string;
  action: ModerationAction;
  reason?: string;
}

interface MarketplaceState {
  listings: MarketplaceListing[];
  total: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  error: string | null;
  isModerating: boolean;
  moderateError: string | null;
  moderateSuccess: string | null;
}

const initialState: MarketplaceState = {
  listings: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  error: null,
  isModerating: false,
  moderateError: null,
  moderateSuccess: null,
};

export const fetchListings = createAsyncThunk(
  'marketplace/fetchListings',
  async (params: FetchListingsParams = {}, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const { page = 1, limit = 20, categoryId, condition, minPrice, maxPrice, search } = params;
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (categoryId) qs.set('categoryId', categoryId);
      if (condition) qs.set('condition', condition);
      if (minPrice !== undefined) qs.set('minPrice', String(minPrice));
      if (maxPrice !== undefined) qs.set('maxPrice', String(maxPrice));
      if (search) qs.set('search', search);

      const response = await fetch(`/api/v1/marketplace?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to fetch listings';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const moderateListing = createAsyncThunk(
  'marketplace/moderateListing',
  async ({ listingId, action, reason }: ModerateListingPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/marketplace/admin/${listingId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to moderate listing';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return { ...data, listingId, action };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearModerateMessages: (state) => {
      state.moderateError = null;
      state.moderateSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.isFetching = false;
        const { data: items, meta } = action.payload?.data ?? {};
        state.listings = Array.isArray(items) ? items : [];
        state.total = meta?.total ?? 0;
        state.currentPage = meta?.page ?? 1;
        state.totalPages = meta?.totalPages ?? 1;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      .addCase(moderateListing.pending, (state) => {
        state.isModerating = true;
        state.moderateError = null;
        state.moderateSuccess = null;
      })
      .addCase(moderateListing.fulfilled, (state, action) => {
        state.isModerating = false;
        const { listingId, action: moderationAction, message } = action.payload;
        state.moderateSuccess = message || `Listing ${moderationAction === 'REMOVE' ? 'removed' : 'approved'} successfully.`;
        // Remove listing from the list if it was removed
        if (moderationAction === 'REMOVE') {
          state.listings = state.listings.filter((l) => l.id !== listingId);
          state.total = Math.max(0, state.total - 1);
        }
      })
      .addCase(moderateListing.rejected, (state, action) => {
        state.isModerating = false;
        state.moderateError = action.payload as string;
      });
  },
});

export const { clearModerateMessages } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
