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

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: 'CUSTOMER' | 'RIDER' | 'ADMIN' | 'SELLER';
}

interface UserState {
  usersList: User[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: UserState = {
  usersList: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  isFetching: false,
  isLoading: false,
  error: null,
  successMessage: null,
};

export const createUser = createAsyncThunk(
  'users/create',
  async (payload: CreateUserPayload, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/register`;

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
        const errorPayload = data.error || data.message || 'Failed to create user';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while creating user');
    }
  }
);

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
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/admin/users${qs ? `?${qs}` : ''}`; 

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

export interface UpdateUserStatusParams {
  userId: string;
  isActive: boolean;
}


export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async (params: UpdateUserStatusParams, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      // Use construct the endpoint specifically based on target status
      // If we are suspending (isActive is false). If reactivating, we assume the endpoint is reactivate.
      const action = params.isActive ? 'reactivate' : 'suspend';
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/admin/users/${params.userId}/${action}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to update user status';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      // Return the ID and new status to update the local state without refetching the whole list
      return { id: params.userId, isActive: params.isActive };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating user status');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

      if (!token) {
        return rejectWithValue('Authentication token is missing. Please log in again.');
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/admin/users/${userId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorPayload = data.error || data.message || 'Failed to delete user';
        return rejectWithValue(typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));
      }

      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = 'User created successfully.';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
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
        } else if (rawData && Array.isArray(rawData.data)) {
          usersArray = rawData.data;
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
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.usersList.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.usersList[index].isActive = action.payload.isActive;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.usersList = state.usersList.filter((u) => u.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
      });
  },
});

export const { clearUserMessages } = userSlice.actions;
export default userSlice.reducer;