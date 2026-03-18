import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface CreateBatchPayload {
  slotLabel: string;
  scheduledAt: string;
  cutoffAt: string;
  maxOrders: number;
  deliveryZoneId: string;
  riderId: string;
}

interface BatchState {
  isCreating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BatchState = {
  isCreating: false,
  error: null,
  successMessage: null,
};

export const createBatch = createAsyncThunk(
  'batches/create',
  async (payload: CreateBatchPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/batches`; // Assuming /api/v1/batches based on the project structure

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
    clearBatchMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
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

export const { clearBatchMessages } = batchSlice.actions;
export default batchSlice.reducer;
