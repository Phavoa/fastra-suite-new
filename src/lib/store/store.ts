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
import { productsApi } from "../../api/purchase/products";
import { unitOfMeasureApi } from "../../api/purchase/unitOfMeasure";
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
      unitOfMeasureApi.middleware
    );
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
