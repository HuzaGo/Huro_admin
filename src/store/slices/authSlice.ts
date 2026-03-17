import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null; 
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || data.error || 'Login failed');
      }

      // Extract user from the response. Adjust based on your actual API structure.
      const user = data.user || data.data?.user || data;
      
      // Check if the user has the 'admin' role
      const userRole = user.role || user.Role;
      if (!userRole || userRole.toLowerCase() !== 'admin') {
        return rejectWithValue('Access denied: You must be an admin to access this dashboard.');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred during login');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const refreshToken = state.auth.refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);

      if (!refreshToken) {
        return rejectWithValue('Refresh token completely missing');
      }

      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || data.error || 'Logout failed');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred during logout');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Debug exactly what the server returns to console
        console.log("Login Payload:", action.payload);

        // Broaden the search for tokens in the response JSON
        const token = 
          action.payload.data?.tokens?.accessToken || 
          action.payload.token || 
          action.payload.accessToken || 
          action.payload.access_token ||
          action.payload.data?.token || 
          action.payload.data?.accessToken || 
          action.payload.data?.access_token || 
          (typeof action.payload.data === 'string' ? action.payload.data : null) ||
          null; 
          
        const refreshToken = 
          action.payload.data?.tokens?.refreshToken || 
          action.payload.refreshToken || 
          action.payload.refresh_token ||
          action.payload.data?.refreshToken || 
          action.payload.data?.refresh_token ||
          null;

        const user = action.payload.user || action.payload.data?.user || action.payload.data || action.payload;
        
        state.token = token;
        state.refreshToken = refreshToken;
        state.user = user;

        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem('token', token);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          if (user) localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;