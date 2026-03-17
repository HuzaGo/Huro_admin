import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  sortOrder: number;
}

interface CreateCategoryPayload {
  name: string;
  iconUrl?: string;
  sortOrder?: number;
}

interface CategoryState {
  categories: Category[];
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isFetching: false,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || data.error || 'Failed to fetch categories');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload: CreateCategoryPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const response = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || data.error || 'Failed to create category');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating category');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isFetching = false;
        state.categories = Array.isArray(action.payload?.data) 
          ? action.payload.data 
          : Array.isArray(action.payload) 
            ? action.payload 
            : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message || 'Category created successfully!';
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryMessages } = categorySlice.actions;
export default categorySlice.reducer;
