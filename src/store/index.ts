import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { userSlice } from "./slice/userSlice";
import { configSlice } from "./slice/configSlice";
import { appInfoSlice } from "./slice/appInfoSlice";
import { billingSlice } from "./slice/billingSlice";
import { multimodalSlice } from "./slice/multimodalSlice";
import thunk from "redux-thunk";

const reducer = combineReducers({
  user: userSlice.reducer,
  config: configSlice.reducer,
  appInfo: appInfoSlice.reducer,
  billing: billingSlice.reducer,
  multimodal: multimodalSlice.reducer,
});

export const initStore = (initState: any) =>
  configureStore({
    reducer,
    middleware: [thunk],
    preloadedState: initState,
  });

class ReduxStore {
  store: ReturnType<typeof initStore>;

  constructor() {
    this.store = initStore({});
  }

  public setStore(store: ReturnType<typeof initStore>) {
    this.store = store;
  }
}

export const reduxStore = new ReduxStore();
const store = reduxStore.store;

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
