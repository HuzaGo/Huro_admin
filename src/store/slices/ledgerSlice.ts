import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type LedgerStatus = 'PENDING' | 'PAID';

export interface LedgerEntry {
  id: string;
  sellerId: string;
  orderId: string;
  amount: number;
  status: LedgerStatus;
  createdAt: string;
  updatedAt?: string;
  seller?: { id: string; businessName?: string; user?: { fullName?: string; email?: string } };
  order?: { id: string; orderNumber?: string };
}

export interface FetchLedgerParams {
  page?: number;
  limit?: number;
  sellerId?: string;
  status?: LedgerStatus | '';
}

interface LedgerState {
  entries: LedgerEntry[];
  total: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  error: string | null;
}

const initialState: LedgerState = {
  entries: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  error: null,
};

export const fetchLedger = createAsyncThunk(
  'ledger/fetch',
  async (params: FetchLedgerParams = {}, { getState, rejectWithValue }) => {
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
      if (params.sellerId) qs.set('sellerId', params.sellerId);
      if (params.status) qs.set('status', params.status);

      const response = await fetch(`/api/v1/ledger?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error?.message || data?.message || 'Failed to fetch ledger';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedger.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchLedger.fulfilled, (state, action) => {
        state.isFetching = false;
        const payload = action.payload?.data;
        const items = Array.isArray(payload?.data) ? payload.data
          : Array.isArray(payload) ? payload
          : [];
        state.entries = items;
        state.total = payload?.meta?.total ?? items.length;
        state.currentPage = payload?.meta?.page ?? 1;
        state.totalPages = payload?.meta?.totalPages ?? 1;
      })
      .addCase(fetchLedger.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      });
  },
});

export default ledgerSlice.reducer;
