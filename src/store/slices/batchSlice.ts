import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface OpenBatchDeliveryZone {
  id?: string;
  name?: string;
  [key: string]: any;
}

export interface OpenBatch {
  id: string;
  slotLabel: string;
  scheduledAt: string;
  fillPercent: number;
  slotsRemaining: number;
  deliveryZone: OpenBatchDeliveryZone;
}

export interface BatchOrder {
  id: string;
  status?: string;
  customer?: { fullName?: string; email?: string; [key: string]: any };
  seller?: { name?: string; [key: string]: any };
  [key: string]: any;
}

export interface BatchDetail {
  id: string;
  slotLabel: string;
  scheduledAt: string;
  cutoffAt?: string;
  maxOrders?: number;
  fillPercent?: number;
  slotsRemaining?: number;
  status?: string;
  deliveryZone?: OpenBatchDeliveryZone;
  rider?: { id?: string; user?: { fullName?: string; [key: string]: any }; [key: string]: any } | null;
  orders?: BatchOrder[];
  [key: string]: any;
}

export interface BatchOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BatchOrderDetail {
  id: string;
  status: string;
  pickupSignature: string;
  snapshotName: string;
  snapshotPhone: string;
  customAddress?: string;
  deliveryName?: string;
  deliveryNote?: string;
  paidAt: string;
  orderItems: BatchOrderItem[];
}

export interface FetchBatchOrdersPayload {
  batchId: string;
  gateId?: string;
  external?: boolean;
}

export interface AssignRiderPayload {
  batchId: string;
  riderId: string;
}

export interface CreateBatchPayload {
  slotLabel: string;
  scheduledAt: string;
  cutoffAt: string;
  maxOrders: number;
  deliveryZoneId: string;
  riderId: string;
}

interface BatchState {
  openBatches: OpenBatch[];
  isFetching: boolean;
  fetchError: string | null;
  batchDetail: BatchDetail | null;
  isFetchingDetail: boolean;
  detailError: string | null;
  isAssigning: boolean;
  assignError: string | null;
  assignSuccess: string | null;
  isDispatching: boolean;
  dispatchError: string | null;
  dispatchSuccess: string | null;
  isCompleting: boolean;
  completeError: string | null;
  completeSuccess: string | null;
  batchOrders: BatchOrderDetail[];
  isFetchingOrders: boolean;
  ordersError: string | null;
  isCreating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BatchState = {
  openBatches: [],
  isFetching: false,
  fetchError: null,
  batchDetail: null,
  isFetchingDetail: false,
  detailError: null,
  isAssigning: false,
  assignError: null,
  assignSuccess: null,
  isDispatching: false,
  dispatchError: null,
  dispatchSuccess: null,
  isCompleting: false,
  completeError: null,
  completeSuccess: null,
  batchOrders: [],
  isFetchingOrders: false,
  ordersError: null,
  isCreating: false,
  error: null,
  successMessage: null,
};

export const fetchBatchOrders = createAsyncThunk(
  'batches/fetchOrders',
  async (payload: FetchBatchOrdersPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const url = new URL(`/api/v1/batches/${payload.batchId}/orders`, window.location.origin);
      if (payload.gateId) url.searchParams.set('gateId', payload.gateId);
      if (payload.external !== undefined) url.searchParams.set('external', String(payload.external));

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch batch orders');
      }

      return (data.data?.orders ?? data.data ?? []) as BatchOrderDetail[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const fetchOpenBatches = createAsyncThunk(
  'batches/fetchOpen',
  async (deliveryZoneId: string | undefined, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const url = new URL('/api/v1/batches/open', window.location.origin);
      if (deliveryZoneId) url.searchParams.set('deliveryZoneId', deliveryZoneId);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch open batches');
      }

      return (data.data ?? data) as OpenBatch[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const fetchBatchDetail = createAsyncThunk(
  'batches/fetchDetail',
  async (batchId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/batches/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch batch detail');
      }

      return (data.data ?? data) as BatchDetail;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const assignRiderToBatch = createAsyncThunk(
  'batches/assignRider',
  async (payload: AssignRiderPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/batches/${payload.batchId}/assign-rider`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ riderId: payload.riderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to assign rider');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const dispatchBatch = createAsyncThunk(
  'batches/dispatch',
  async (batchId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/batches/${batchId}/dispatch`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to dispatch batch');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const completeBatch = createAsyncThunk(
  'batches/complete',
  async (batchId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/batches/${batchId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to complete batch');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const createBatch = createAsyncThunk(
  'batches/create',
  async (payload: CreateBatchPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const response = await fetch('/api/v1/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to create batch';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating the batch');
    }
  }
);

const batchSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {
    clearBatchOrders: (state) => {
      state.batchOrders = [];
      state.ordersError = null;
    },
    clearBatchMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearAssignMessages: (state) => {
      state.assignError = null;
      state.assignSuccess = null;
    },
    clearDispatchMessages: (state) => {
      state.dispatchError = null;
      state.dispatchSuccess = null;
    },
    clearCompleteMessages: (state) => {
      state.completeError = null;
      state.completeSuccess = null;
    },
    clearBatchDetail: (state) => {
      state.batchDetail = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatchOrders.pending, (state) => {
        state.isFetchingOrders = true;
        state.ordersError = null;
        state.batchOrders = [];
      })
      .addCase(fetchBatchOrders.fulfilled, (state, action) => {
        state.isFetchingOrders = false;
        state.batchOrders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBatchOrders.rejected, (state, action) => {
        state.isFetchingOrders = false;
        state.ordersError = action.payload as string;
      })
      .addCase(fetchOpenBatches.pending, (state) => {
        state.isFetching = true;
        state.fetchError = null;
      })
      .addCase(fetchOpenBatches.fulfilled, (state, action) => {
        state.isFetching = false;
        state.openBatches = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOpenBatches.rejected, (state, action) => {
        state.isFetching = false;
        state.fetchError = action.payload as string;
      })
      .addCase(fetchBatchDetail.pending, (state) => {
        state.isFetchingDetail = true;
        state.detailError = null;
        state.batchDetail = null;
      })
      .addCase(fetchBatchDetail.fulfilled, (state, action) => {
        state.isFetchingDetail = false;
        state.batchDetail = action.payload;
      })
      .addCase(fetchBatchDetail.rejected, (state, action) => {
        state.isFetchingDetail = false;
        state.detailError = action.payload as string;
      })
      .addCase(assignRiderToBatch.pending, (state) => {
        state.isAssigning = true;
        state.assignError = null;
        state.assignSuccess = null;
      })
      .addCase(assignRiderToBatch.fulfilled, (state) => {
        state.isAssigning = false;
        state.assignSuccess = 'Rider assigned successfully';
      })
      .addCase(assignRiderToBatch.rejected, (state, action) => {
        state.isAssigning = false;
        state.assignError = action.payload as string;
      })
      .addCase(dispatchBatch.pending, (state) => {
        state.isDispatching = true;
        state.dispatchError = null;
        state.dispatchSuccess = null;
      })
      .addCase(dispatchBatch.fulfilled, (state) => {
        state.isDispatching = false;
        state.dispatchSuccess = 'Batch dispatched successfully';
      })
      .addCase(dispatchBatch.rejected, (state, action) => {
        state.isDispatching = false;
        state.dispatchError = action.payload as string;
      })
      .addCase(completeBatch.pending, (state) => {
        state.isCompleting = true;
        state.completeError = null;
        state.completeSuccess = null;
      })
      .addCase(completeBatch.fulfilled, (state) => {
        state.isCompleting = false;
        state.completeSuccess = 'Batch completed successfully';
      })
      .addCase(completeBatch.rejected, (state, action) => {
        state.isCompleting = false;
        state.completeError = action.payload as string;
      })
      .addCase(createBatch.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBatch.fulfilled, (state) => {
        state.isCreating = false;
        state.successMessage = 'Batch created successfully';
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBatchOrders, clearBatchMessages, clearBatchDetail, clearAssignMessages, clearDispatchMessages, clearCompleteMessages } = batchSlice.actions;
export default batchSlice.reducer;
