import { createSlice } from "@reduxjs/toolkit";

export const appInfoSlice = createSlice({
  name: "appInfo",
  initialState: {
    currentMenu: "",
  },
  reducers: {
    setAppCurrentMenu(state, action) {
      state.currentMenu = action.payload;
    },
  },
});

export const {
  setAppCurrentMenu
} = appInfoSlice.actions;
