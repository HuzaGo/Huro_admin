import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface OrderItem {
  id?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  [key: string]: any;
}

export interface Order {
  id: string;
  status: OrderStatus;
  paymentStatus?: string;
  cartTotal?: string;
  payableAmount?: string;
  createdAt?: string;
  deliveredAt?: string | null;
  snapshotZoneName?: string;
  snapshotZoneType?: string;
  itemCount?: number;
  batch?: { id?: string; slotLabel?: string; [key: string]: any };
  orderItems?: OrderItem[];
  [key: string]: any;
}

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | '';
  picked?: 'true' | 'false' | '';
}

interface OrderState {
  orders: Order[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetch',
  async (params: FetchOrdersParams = {}, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const url = new URL('/api/v1/orders', window.location.origin);
      url.searchParams.set('page', String(params.page ?? 1));
      url.searchParams.set('limit', String(params.limit ?? 20));
      if (params.status) url.searchParams.set('status', params.status);
      if (params.picked) url.searchParams.set('picked', params.picked);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch orders');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isFetching = false;
        const payload = action.payload;
        // Response shape: { success, data: { data: Order[], meta: {...} } }
        state.orders = Array.isArray(payload?.data?.data) ? payload.data.data : [];
        const meta = payload?.data?.meta ?? {};
        state.totalCount = meta.total ?? state.orders.length;
        state.totalPages = meta.totalPages ?? 1;
        state.currentPage = meta.page ?? 1;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;
