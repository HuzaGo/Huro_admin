import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type DeliveryZoneType = 'CAMPUS' | 'EXTERNAL';

export interface DeliveryZone {
  id: string;
  name: string;
  type: DeliveryZoneType;
  deliveryFee: number;
  pickupLabel: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateDeliveryZonePayload {
  name: string;
  type: DeliveryZoneType;
  deliveryFee: number;
  pickupLabel: string;
  description?: string;
}

export interface UpdateDeliveryZonePayload {
  zoneId: string;
  name?: string;
  type?: DeliveryZoneType;
  deliveryFee?: number;
  pickupLabel?: string;
  description?: string;
}

interface DeliveryZoneState {
  zones: DeliveryZone[];
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isToggling: boolean;
  error: string | null;
  createError: string | null;
  createSuccess: string | null;
  updateError: string | null;
  updateSuccess: string | null;
  deleteError: string | null;
  toggleWarning: string | null;
}

const initialState: DeliveryZoneState = {
  zones: [],
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isToggling: false,
  error: null,
  createError: null,
  createSuccess: null,
  updateError: null,
  updateSuccess: null,
  deleteError: null,
  toggleWarning: null,
};

export const fetchDeliveryZones = createAsyncThunk(
  'deliveryZones/fetch',
  async (type: DeliveryZoneType | undefined, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const qs = type ? `?type=${type}` : '';
      const response = await fetch(`/api/v1/delivery-zones${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to fetch delivery zones';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const createDeliveryZone = createAsyncThunk(
  'deliveryZones/create',
  async (payload: CreateDeliveryZonePayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch('/api/v1/delivery-zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to create delivery zone';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const updateDeliveryZone = createAsyncThunk(
  'deliveryZones/update',
  async (payload: UpdateDeliveryZonePayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const { zoneId, ...body } = payload;

      const response = await fetch(`/api/v1/delivery-zones/${zoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to update delivery zone';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return { ...data, zoneId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deleteDeliveryZone = createAsyncThunk(
  'deliveryZones/delete',
  async (zoneId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/delivery-zones/${zoneId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to delete delivery zone';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return { zoneId, ...data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const toggleDeliveryZone = createAsyncThunk(
  'deliveryZones/toggle',
  async (zoneId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/delivery-zones/${zoneId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to toggle delivery zone';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return { zoneId, isActive: data.data?.isActive, warning: data.data?.warning };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const deliveryZoneSlice = createSlice({
  name: 'deliveryZones',
  initialState,
  reducers: {
    clearCreateMessages: (state) => {
      state.createError = null;
      state.createSuccess = null;
    },
    clearUpdateMessages: (state) => {
      state.updateError = null;
      state.updateSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryZones.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchDeliveryZones.fulfilled, (state, action) => {
        state.isFetching = false;
        const zones: DeliveryZone[] =
          Array.isArray(action.payload?.data) ? action.payload.data : [];
        state.zones = zones;
      })
      .addCase(fetchDeliveryZones.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      .addCase(createDeliveryZone.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createDeliveryZone.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createSuccess = action.payload?.message || 'Delivery zone created successfully!';
      })
      .addCase(createDeliveryZone.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      .addCase(updateDeliveryZone.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateDeliveryZone.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.updateSuccess = action.payload?.message || 'Delivery zone updated successfully!';
      })
      .addCase(updateDeliveryZone.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      .addCase(deleteDeliveryZone.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteDeliveryZone.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.zones = state.zones.filter((z) => z.id !== action.payload.zoneId);
      })
      .addCase(deleteDeliveryZone.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      })
      .addCase(toggleDeliveryZone.pending, (state) => {
        state.isToggling = true;
        state.toggleWarning = null;
      })
      .addCase(toggleDeliveryZone.fulfilled, (state, action) => {
        state.isToggling = false;
        state.toggleWarning = action.payload.warning ?? null;
        state.zones = state.zones.map((z) =>
          z.id === action.payload.zoneId
            ? { ...z, isActive: Boolean(action.payload.isActive) }
            : z
        );
      })
      .addCase(toggleDeliveryZone.rejected, (state) => {
        state.isToggling = false;
      });
  },
});

export const { clearCreateMessages, clearUpdateMessages } = deliveryZoneSlice.actions;
export default deliveryZoneSlice.reducer;
