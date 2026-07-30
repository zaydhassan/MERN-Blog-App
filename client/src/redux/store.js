import { createSlice, configureStore, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLogin: localStorage.getItem("isLogin") === "true",
  user: (() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  })(),
};

export const updateUser = createAsyncThunk(
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
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      // Guard against invalid payloads without returning undefined (which is
      // illegal in an Immer reducer and would throw).
      if (!action.payload || !action.payload._id) {
        return state;
      }
      state.isLogin = true;
      state.user = action.payload;
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout(state) {
      state.isLogin = false;
      state.user = null;
      localStorage.removeItem("isLogin");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
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
});

export const authActions = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});
