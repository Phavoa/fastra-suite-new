// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { authApi } from "../../api/authApi";
import { userApi } from "../../api/userApi";
import { productsApi } from "../../api/purchase/productsApi";
import { unitOfMeasureApi } from "../../api/purchase/unitOfMeasureApi";
import { vendorsApi } from "../../api/purchase/vendorsApi";
import { purchaseRequestApi } from "../../api/purchase/purchaseRequestApi";
import { requestForQuotationApi } from "../../api/purchase/requestForQuotationApi";
import { currencyApi } from "../../api/purchase/currencyApi";
import { locationApi } from "../../api/inventory/locationApi";
import authReducer from "./authSlice";

const authPersistConfig = {
  key: "auth",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [productsApi.reducerPath]: productsApi.reducer,
  [unitOfMeasureApi.reducerPath]: unitOfMeasureApi.reducer,
  [vendorsApi.reducerPath]: vendorsApi.reducer,
  [purchaseRequestApi.reducerPath]: purchaseRequestApi.reducer,
  [requestForQuotationApi.reducerPath]: requestForQuotationApi.reducer,
  [currencyApi.reducerPath]: currencyApi.reducer,
  [locationApi.reducerPath]: locationApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      userApi.middleware,
      productsApi.middleware,
      unitOfMeasureApi.middleware,
      vendorsApi.middleware,
      purchaseRequestApi.middleware,
      requestForQuotationApi.middleware,
      currencyApi.middleware,
      locationApi.middleware
    );
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
