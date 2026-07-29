import { createSlice, configureStore, createAsyncThunk } from "@reduxjs/toolkit";
<<<<<<< HEAD
import axios from "axios";

const initialState = {
  isLogin: localStorage.getItem("isLogin") === "true",
  user: (() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    } catch {
=======

const initialState = {
  isLogin: localStorage.getItem('isLogin') === 'true',
  user: (() => {
    try {
      const storedUser = localStorage.getItem('user');
      console.log("Loaded user from localStorage (before parsing):", storedUser);

      return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null; 
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
      return null;
    }
  })(),
};

export const updateUser = createAsyncThunk(
<<<<<<< HEAD
  "auth/updateUser",
  async (userData, { rejectWithValue }) => {
    try {
      // Use the shared axios instance so the auth interceptor attaches the
      // access token (the previous raw fetch() bypassed auth entirely).
      const { data } = await axios.put(`/api/v1/user/${userData.id}`, userData);
      if (!data.success) {
        throw new Error(data.message || "Failed to update user.");
      }
      return data.user;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to update user.";
      return rejectWithValue(message);
=======
  'auth/updateUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/user/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user.');
      }

      console.log("Updated user from backend:", data.user); 
      return data.user;
    } catch (error) {
      console.error('Update error:', error);
      return rejectWithValue(error.message);
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
<<<<<<< HEAD
      // Guard against invalid payloads without returning undefined (which is
      // illegal in an Immer reducer and would throw).
      if (!action.payload || !action.payload._id) {
        return state;
      }
      state.isLogin = true;
      state.user = action.payload;
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("user", JSON.stringify(action.payload));
=======
      console.log("User received on login:", action.payload); 

      if (!action.payload || !action.payload._id) {
        console.error("Login failed: User data is invalid", action.payload);
        return;
      }

      state.isLogin = true;
      state.user = action.payload;

      localStorage.setItem('isLogin', 'true');
      localStorage.setItem('user', JSON.stringify(action.payload)); 
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    },
    logout(state) {
      state.isLogin = false;
      state.user = null;
<<<<<<< HEAD
      localStorage.removeItem("isLogin");
      localStorage.removeItem("user");
=======
      localStorage.removeItem('isLogin');
      localStorage.removeItem('user');
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
<<<<<<< HEAD
        if (action.payload) {
          state.user = action.payload;
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        // Surface the message for the UI; no console logging of user data.
        state.updateError = action.payload;
      });
  },
=======
        console.log("Redux state updated with:", action.payload);
        state.user = action.payload;
        if (action.payload) {
          localStorage.setItem('user', JSON.stringify(action.payload));
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        console.error('Failed to update user:', action.payload);
      });
  }
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
});

export const authActions = authSlice.actions;

export const store = configureStore({
  reducer: {
<<<<<<< HEAD
    auth: authSlice.reducer,
  },
});
=======
    auth: authSlice.reducer, 
  },
});
>>>>>>> 94f0376a8509e9530791291eefaed4899f732725
