import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Rider {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  nationalId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRiderPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  vehicleType: string;
  vehiclePlate: string;
  nationalId: string;
}

export interface FetchRidersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface RiderState {
  riders: Rider[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: RiderState = {
  riders: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const fetchRiders = createAsyncThunk(
  'riders/fetch',
  async (params: FetchRidersParams = {}, { getState, rejectWithValue }) => {
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
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/admin/riders${qs ? `?${qs}` : ''}`; // Adjust endpoint as needed to match GET /admin/riders

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to fetch riders';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching riders');
    }
  }
);

export const createRider = createAsyncThunk(
  'riders/create',
  async (payload: CreateRiderPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/admin/riders`;

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
        const errorPayload = data.error || data.message || 'Failed to create rider';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating rider');
    }
  }
);

const riderSlice = createSlice({
  name: 'riders',
  initialState,
  reducers: {
    clearRiderMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Riders
      .addCase(fetchRiders.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchRiders.fulfilled, (state, action) => {
        state.isFetching = false;
        
        let rawData = action.payload;
        if (rawData?.data) {
          rawData = rawData.data;
        }

        let ridersArray: Rider[] = [];
        if (Array.isArray(rawData)) {
          ridersArray = rawData;
        } else if (rawData && Array.isArray(rawData.items)) {
          ridersArray = rawData.items;
        } else if (rawData && Array.isArray(rawData.riders)) {
          ridersArray = rawData.riders;
        } else if (rawData && Array.isArray(rawData.results)) {
          ridersArray = rawData.results;
        } else if (rawData && rawData.data && Array.isArray(rawData.data)) {
          ridersArray = rawData.data;
        } else if (Array.isArray(action.payload)) {
          ridersArray = action.payload;
        }

        state.riders = ridersArray;
        
        const metaSource = action.payload?.meta || action.payload?.pagination || rawData?.meta || rawData;
        state.totalCount = metaSource?.total || metaSource?.totalCount || metaSource?.count || ridersArray.length || 0;
        state.currentPage = metaSource?.page || metaSource?.currentPage || 1;
        state.totalPages = metaSource?.totalPages || metaSource?.pages || 1;
      })
      .addCase(fetchRiders.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      // Create Rider
      .addCase(createRider.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createRider.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message || 'Rider created successfully!';
      })
      .addCase(createRider.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRiderMessages } = riderSlice.actions;
export default riderSlice.reducer;
