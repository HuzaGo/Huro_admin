import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  role?: 'CUSTOMER' | 'RIDER' | 'ADMIN';
  search?: string;
  isActive?: boolean;
}

interface UserState {
  usersList: User[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  error: string | null;
}

const initialState: UserState = {
  usersList: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetch',
  async (params: FetchUsersParams = {}, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.append('page', params.page.toString());
      if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
      if (params.role) searchParams.append('role', params.role);
      if (params.search) searchParams.append('search', params.search);
      if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

      const qs = searchParams.toString();
      // Using identical setup pattern from seller and riders
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://huzago-backend.onrender.com'}/api/v1/admin/users${qs ? `?${qs}` : ''}`; 

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to fetch users';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching users');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isFetching = false;
        
        let rawData = action.payload;
        if (rawData?.data) {
          rawData = rawData.data;
        }

        let usersArray: User[] = [];
        if (Array.isArray(rawData)) {
          usersArray = rawData;
        } else if (rawData && Array.isArray(rawData.items)) {
          usersArray = rawData.items;
        } else if (rawData && Array.isArray(rawData.users)) {
          usersArray = rawData.users;
        }

        state.usersList = usersArray;

        const metaSource = action.payload?.meta || action.payload?.pagination || rawData?.meta || rawData;
        state.totalCount = metaSource?.total || metaSource?.totalCount || metaSource?.count || usersArray.length || 0;
        state.currentPage = metaSource?.page || metaSource?.currentPage || 1;
        state.totalPages = metaSource?.totalPages || metaSource?.pages || 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;