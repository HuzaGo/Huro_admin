import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Campus {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Gate {
  id: string;
  name: string;
  pickupLabel: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  sortOrder?: number;
  isActive: boolean;
}

export interface CreateGatePayload {
  zoneId: string;
  name: string;
  pickupLabel: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  sortOrder?: number;
}

export interface UpdateGatePayload {
  zoneId: string;
  gateId: string;
  name?: string;
  pickupLabel?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CampusState {
  campuses: Campus[];
  gates: Record<string, Gate[]>;
  isFetchingGates: Record<string, boolean>;
  isFetching: boolean;
  error: string | null;
  isCreatingGate: boolean;
  createGateError: string | null;
  createGateSuccess: string | null;
  isUpdatingGate: boolean;
  updateGateError: string | null;
  updateGateSuccess: string | null;
  isToggling: boolean;
}

const initialState: CampusState = {
  campuses: [],
  gates: {},
  isFetchingGates: {},
  isFetching: false,
  error: null,
  isCreatingGate: false,
  createGateError: null,
  createGateSuccess: null,
  isUpdatingGate: false,
  updateGateError: null,
  updateGateSuccess: null,
  isToggling: false,
};

export const fetchCampuses = createAsyncThunk(
  'campuses/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/campuses');
      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to fetch campuses';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const fetchCampusGates = createAsyncThunk(
  'campuses/fetchGates',
  async (zoneId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/campuses/${zoneId}/gates`);
      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to fetch gates';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return { zoneId, gates: data.data ?? [] };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const createCampusGate = createAsyncThunk(
  'campuses/createGate',
  async (payload: CreateGatePayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const { zoneId, ...body } = payload;

      const response = await fetch(`/api/v1/campuses/${zoneId}/gates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to create gate';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return { ...data, zoneId, sentBody: body };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const updateCampusGate = createAsyncThunk(
  'campuses/updateGate',
  async (payload: UpdateGatePayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const { zoneId, gateId, ...body } = payload;

      const response = await fetch(`/api/v1/campuses/${zoneId}/gates/${gateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to update gate';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return { ...data, zoneId, gateId, updates: body };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const toggleCampus = createAsyncThunk(
  'campuses/toggle',
  async (zoneId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token =
        state.auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) return rejectWithValue('Authentication token is missing.');

      const response = await fetch(`/api/v1/campuses/${zoneId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.error || data.message || 'Failed to toggle campus';
        return rejectWithValue(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      return { zoneId, isActive: data.data?.isActive };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const campusSlice = createSlice({
  name: 'campuses',
  initialState,
  reducers: {
    clearGateMessages: (state) => {
      state.createGateError = null;
      state.createGateSuccess = null;
      state.updateGateError = null;
      state.updateGateSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampuses.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchCampuses.fulfilled, (state, action) => {
        state.isFetching = false;
        state.campuses = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchCampuses.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCampusGates.pending, (state, action) => {
        state.isFetchingGates[action.meta.arg] = true;
      })
      .addCase(fetchCampusGates.fulfilled, (state, action) => {
        state.isFetchingGates[action.payload.zoneId] = false;
        state.gates[action.payload.zoneId] = action.payload.gates;
      })
      .addCase(fetchCampusGates.rejected, (state, action) => {
        state.isFetchingGates[action.meta.arg] = false;
      })
      .addCase(createCampusGate.pending, (state) => {
        state.isCreatingGate = true;
        state.createGateError = null;
        state.createGateSuccess = null;
      })
      .addCase(createCampusGate.fulfilled, (state, action) => {
        state.isCreatingGate = false;
        state.createGateSuccess = action.payload?.message || 'Gate created successfully!';
        // Store gate in local list if API returns id
        const { zoneId, sentBody, data } = action.payload;
        if (data?.id) {
          const existing = state.gates[zoneId] ?? [];
          state.gates[zoneId] = [
            ...existing,
            { id: data.id, isActive: true, ...sentBody, ...data },
          ];
        }
      })
      .addCase(createCampusGate.rejected, (state, action) => {
        state.isCreatingGate = false;
        state.createGateError = action.payload as string;
      })
      .addCase(updateCampusGate.pending, (state) => {
        state.isUpdatingGate = true;
        state.updateGateError = null;
        state.updateGateSuccess = null;
      })
      .addCase(updateCampusGate.fulfilled, (state, action) => {
        state.isUpdatingGate = false;
        state.updateGateSuccess = action.payload?.message || 'Gate updated successfully!';
        const { zoneId, gateId, updates } = action.payload;
        if (state.gates[zoneId]) {
          state.gates[zoneId] = state.gates[zoneId].map((g) =>
            g.id === gateId ? { ...g, ...updates } : g
          );
        }
      })
      .addCase(updateCampusGate.rejected, (state, action) => {
        state.isUpdatingGate = false;
        state.updateGateError = action.payload as string;
      })
      .addCase(toggleCampus.pending, (state) => {
        state.isToggling = true;
      })
      .addCase(toggleCampus.fulfilled, (state, action) => {
        state.isToggling = false;
        state.campuses = state.campuses.map((c) =>
          c.id === action.payload.zoneId
            ? { ...c, isActive: Boolean(action.payload.isActive) }
            : c
        );
      })
      .addCase(toggleCampus.rejected, (state) => {
        state.isToggling = false;
      });
  },
});

export const { clearGateMessages } = campusSlice.actions;
export default campusSlice.reducer;
