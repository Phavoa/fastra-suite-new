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
import { companyApi } from "@/api/settings/companyApi";
import { usersApi } from "@/api/settings/usersApi";
import { currencyApi } from "../../api/purchase/currencyApi";
import authReducer from "./authSlice";
import viewModeReducer from '../../components/Settings/viewModeSlice'

const authPersistConfig = {
  key: "auth",
  storage,
};
const viewModePersistConfig = {
  key: "viewMode",
  storage,
};


const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  viewMode: persistReducer(viewModePersistConfig, viewModeReducer),
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer, // for settings
  [productsApi.reducerPath]: productsApi.reducer,
  [unitOfMeasureApi.reducerPath]: unitOfMeasureApi.reducer,
  [vendorsApi.reducerPath]: vendorsApi.reducer,
  [purchaseRequestApi.reducerPath]: purchaseRequestApi.reducer,
  [currencyApi.reducerPath]: currencyApi.reducer,
  [companyApi.reducerPath]: companyApi.reducer,
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
      usersApi.middleware,
      productsApi.middleware,
      unitOfMeasureApi.middleware,
      vendorsApi.middleware,
      purchaseRequestApi.middleware,
      currencyApi.middleware,
      companyApi.middleware
    );
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
